// the-graph.ts
import axios from "axios";

const ETHERSCAN_API = process.env.ETHERSCAN_API || "";
const ETHERSCAN_NETWORK = (process.env.ETHERSCAN_NETWORK || "mainnet").toLowerCase(); // "mainnet" | "sepolia"
const SNAPSHOT_SUBGRAPH = "https://hub.snapshot.org/graphql";
const UNISWAP_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

// Simple in-memory cache to avoid repeated network calls during a single process run.
type CacheEntry = { ts: number; ttl: number; value: any };
const cache = new Map<string, CacheEntry>();
function getCached<T>(key: string): T | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() > e.ts + e.ttl) {
    cache.delete(key);
    return null;
  }
  return e.value as T;
}
function setCached(key: string, value: any, ttl = 1000 * 60 * 5) {
  cache.set(key, { ts: Date.now(), ttl, value });
}

if (!ETHERSCAN_API) {
  console.warn("⚠️ ETHERSCAN_API not set — wallet age may not work correctly.");
}

function etherscanBaseApi(network: string) {
  if (network === "sepolia") return "https://api-sepolia.etherscan.io/api";
  return "https://api.etherscan.io/api"; // default mainnet
}

/**
 * Get earliest timestamp across txlist, tokentx, txlistinternal.
 */
async function getEarliestOnchainTimestamp(address: string): Promise<number | null> {
  if (!ETHERSCAN_API) return null;

  const cacheKey = `etherscan-earliest:${address}:${ETHERSCAN_NETWORK}`;
  const cached = getCached<number>(cacheKey);
  if (cached !== null) return cached;

  const base = etherscanBaseApi(ETHERSCAN_NETWORK);
  const actions = ["txlist", "tokentx", "txlistinternal"];
  const urls = actions.map(
    (action) =>
      `${base}?module=account&action=${action}&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API}`
  );

  const results = await Promise.allSettled(urls.map((u) => axios.get(u)));

  const timestamps: number[] = [];

  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const arr = Array.isArray(r.value.data?.result) ? r.value.data.result : [];
    if (arr.length === 0) continue;

    // Etherscan returns sorted results when sort=asc but be defensive:
    // extract timestamp fields and pick the minimum positive value.
    const foundTimestamps = arr
      .map((tx: any) => parseInt(tx.timeStamp || tx.timestamp || tx.TimeStamp || "0", 10))
      .filter((n: number) => Number.isFinite(n) && n > 0);

    if (foundTimestamps.length) timestamps.push(Math.min(...foundTimestamps));
  }

  return timestamps.length ? Math.min(...timestamps) : null;
}


/**
 * Wallet age (days + years)
 */
export async function getWalletAge(address: string): Promise<{ days: number; years: number }> {
  try {
    const earliest = await getEarliestOnchainTimestamp(address);
    if (!earliest) return { days: 0, years: 0 };

    const nowSec = Math.floor(Date.now() / 1000);
    const diffSec = Math.max(0, nowSec - earliest);
    const days = Math.floor(diffSec / (60 * 60 * 24));
    const years = Math.floor(days / 365);
    return { days, years };
  } catch (err) {
    console.error("Error fetching wallet age:", err);
    return { days: 0, years: 0 };
  }
}

// ------------------ DAO votes (Snapshot w/ pagination) ------------------

// Returns the number of unique proposals voted on (deduplicated)
export async function getDaoVotes(address: string): Promise<number> {
  const voter = address.toLowerCase();
  let skip = 0;
  let total = 0;
  // We'll count unique proposal IDs the wallet voted on to avoid accidental duplicates
  // and improve accuracy. Also fetch `created` for potential future timeline needs.
  const uniqueProposals = new Set<string>();
  const pageSize = 1000; // increase page size for fewer requests

  // helper to perform a single page fetch with retries
  async function fetchPage(currentSkip: number) {
    const query = `
      query Votes($voter: String!, $first: Int!, $skip: Int!) {
        votes(where: { voter: $voter }, first: $first, skip: $skip, orderBy: "created", orderDirection: desc) {
          id
          created
          proposal {
            id
          }
        }
      }
    `;

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await axios.post(SNAPSHOT_SUBGRAPH, {
          query,
          variables: { voter, first: pageSize, skip: currentSkip },
        });

        const votes = res.data?.data?.votes ?? [];
        return votes;
      } catch (err) {
        const isLast = attempt === maxAttempts;
  console.warn(`Snapshot fetch attempt ${attempt} failed (skip=${currentSkip})${isLast ? ", giving up" : ", retrying"}.`, (err as any)?.message || err);
        if (isLast) return null;
        // backoff
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }

    return null;
  }

  while (true) {
    const votes = await fetchPage(skip);
    if (!votes) break; // failed after retries
    if (!votes.length) break;

    for (const v of votes) {
      const pid = v?.proposal?.id ?? null;
      if (pid) uniqueProposals.add(pid.toString());
      else if (v?.id) uniqueProposals.add(`vote:${v.id}`); // fallback to vote id if no proposal
    }

    skip += votes.length;
    // Stop early if we received fewer than pageSize (end of results)
    if (votes.length < pageSize) break;
  }

  total = uniqueProposals.size;
  return total;
}

// More detailed DAO vote information (unique proposals, weighted VP sum, earliest vote)
export async function getDaoVotesDetailed(address: string): Promise<{ uniqueProposals: number; weightedVp: number; earliestVoteTs: number | null }> {
  const voter = address.toLowerCase();
  const cacheKey = `snapshot-detailed:${voter}`;
  const cached = getCached<{ uniqueProposals: number; weightedVp: number; earliestVoteTs: number | null }>(cacheKey);
  if (cached) return cached;
  let skip = 0;
  const uniqueProposals = new Set<string>();
  let weightedVp = 0;
  let earliest: number | null = null;
  const pageSize = 1000;

  async function fetchPage(currentSkip: number) {
    const query = `
      query Votes($voter: String!, $first: Int!, $skip: Int!) {
        votes(where: { voter: $voter }, first: $first, skip: $skip, orderBy: "created", orderDirection: desc) {
          id
          created
          vp
          proposal { id }
          space { id }
        }
      }
    `;

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await axios.post(SNAPSHOT_SUBGRAPH, {
          query,
          variables: { voter, first: pageSize, skip: currentSkip },
          timeout: 10000,
        });

        const votes = res.data?.data?.votes ?? [];
        return votes;
      } catch (err) {
        const isLast = attempt === maxAttempts;
        console.warn(`Snapshot fetch attempt ${attempt} failed (skip=${currentSkip})${isLast ? ", giving up" : ", retrying"}.`, (err as any)?.message || err);
        if (isLast) return null;
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }

    return null;
  }

  while (true) {
    const votes = await fetchPage(skip);
    if (!votes) break;
    if (!votes.length) break;

    for (const v of votes) {
      const pid = v?.proposal?.id ?? null;
      if (pid) uniqueProposals.add(pid.toString());
      else if (v?.id) uniqueProposals.add(`vote:${v.id}`);

      // vp may be stringified number; try to parse
      const vpNum = parseFloat(v?.vp ?? "0") || 0;
      if (vpNum > 0) weightedVp += vpNum;

      const created = v?.created ? parseInt(v.created.toString(), 10) : NaN;
      if (Number.isFinite(created) && created > 0) {
        earliest = earliest === null ? created : Math.min(earliest, created);
      }
    }

    skip += votes.length;
    if (votes.length < pageSize) break;
  }

  const out = { uniqueProposals: uniqueProposals.size, weightedVp: Math.round(weightedVp), earliestVoteTs: earliest };
  setCached(cacheKey, out, 1000 * 60 * 10); // cache 10 minutes
  return out;
}


// ------------------ DeFi usage (Uniswap positions w/ pagination) ------------------

export async function getUniswapPositions(address: string): Promise<number> {
  const user = address.toLowerCase();
  let skip = 0;
  let total = 0;

  while (true) {
    const query = `
      query GetPositions($user: String!, $first: Int!, $skip: Int!) {
        positions(where: { owner: $user }, first: $first, skip: $skip) {
          id
        }
      }
    `;

    try {
      const res = await axios.post(UNISWAP_SUBGRAPH, {
        query,
        variables: { user, first: 500, skip },
      });

      const positions = res.data?.data?.positions ?? [];
      if (!positions.length) break;

      total += positions.length;
      skip += 500;
    } catch (err) {
      console.error("Error fetching Uniswap positions:", err);
      break;
    }
  }

  return total;
}

// Detailed Uniswap data: count, unique pools, total liquidity (approx)
export async function getUniswapPositionsDetailed(address: string): Promise<{ positions: number; uniquePools: number; totalLiquidity: number }> {
  const user = address.toLowerCase();
  const cacheKey = `uniswap-detailed:${user}`;
  const cached = getCached<{ positions: number; uniquePools: number; totalLiquidity: number }>(cacheKey);
  if (cached) return cached;
  let skip = 0;
  const poolSet = new Set<string>();
  let positionsCount = 0;
  let totalLiquidity = 0;
  const pageSize = 1000;

  async function fetchPage(currentSkip: number) {
    const query = `
      query GetPositions($user: String!, $first: Int!, $skip: Int!) {
        positions(where: { owner: $user }, first: $first, skip: $skip) {
          id
          liquidity
          pool { id }
        }
      }
    `;

    try {
      const res = await axios.post(UNISWAP_SUBGRAPH, {
        query,
        variables: { user, first: pageSize, skip: currentSkip },
        timeout: 10000,
      });

      return res.data?.data?.positions ?? [];
    } catch (err) {
      console.warn("Error fetching Uniswap positions page:", (err as any)?.message || err);
      return null;
    }
  }

  while (true) {
    const positions = await fetchPage(skip);
    if (!positions) break;
    if (!positions.length) break;

    for (const p of positions) {
      positionsCount += 1;
      const poolId = p?.pool?.id ?? null;
      if (poolId) poolSet.add(poolId.toString());

      // liquidity may be a string representing a big integer, parse loosely
      const liq = parseFloat(p?.liquidity ?? "0") || 0;
      if (liq > 0) totalLiquidity += liq;
    }

    skip += positions.length;
    if (positions.length < pageSize) break;
  }

  const out = { positions: positionsCount, uniquePools: poolSet.size, totalLiquidity };
  setCached(cacheKey, out, 1000 * 60 * 10);
  return out;
}

// ------------------ Reputation wrapper ------------------

export async function fetchWalletActivity(address: string) {
  const normalized = address.toLowerCase();

  // gather enhanced data in parallel
  const [ageObj, votesDetailed, defiDetailed] = await Promise.all([
    getWalletAge(normalized),
    getDaoVotesDetailed(normalized),
    getUniswapPositionsDetailed(normalized),
  ]);

  // Per-source confidence and provenance
  const sources = {
    etherscan: { present: ageObj.days > 0, confidence: ageObj.days > 0 ? 90 : 30 },
    snapshot: { present: votesDetailed.uniqueProposals > 0, confidence: votesDetailed.uniqueProposals > 0 ? 90 : 30 },
    uniswap: { present: defiDetailed.positions > 0, confidence: defiDetailed.positions > 0 ? 85 : 25 },
  };

  // Aggregate confidence (weighted average)
  const totalWeight = (sources.etherscan.confidence || 0) + (sources.snapshot.confidence || 0) + (sources.uniswap.confidence || 0);
  const aggConfidence = totalWeight ? Math.round((sources.etherscan.confidence * 0.4 + sources.snapshot.confidence * 0.4 + sources.uniswap.confidence * 0.2)) : 50;

  const out = {
    walletAgeDays: ageObj.days,
    walletAgeYears: ageObj.years,
    daoVotes: votesDetailed.uniqueProposals,
    defiInteractions: defiDetailed.positions,
    dao: {
      uniqueProposals: votesDetailed.uniqueProposals,
      weightedVp: votesDetailed.weightedVp,
      earliestVoteTs: votesDetailed.earliestVoteTs,
    },
    defi: {
      positions: defiDetailed.positions,
      uniquePools: defiDetailed.uniquePools,
      totalLiquidity: defiDetailed.totalLiquidity,
    },
    sources,
    confidence: aggConfidence,
  };

  return out;
}
