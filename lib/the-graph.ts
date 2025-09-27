import axios from "axios";

const ETHERSCAN_API = process.env.ETHERSCAN_API!;
const SNAPSHOT_SUBGRAPH = "https://hub.snapshot.org/graphql";
const UNISWAP_SUBGRAPH =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

// ------------------ Core Wallet Activity ------------------

// 1. Get wallet age (first tx)
async function getWalletAge(address: string): Promise<number> {
  try {
    const res = await axios.get(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc&apikey=${ETHERSCAN_API}`
    );
    const txs = res.data?.result || [];
    if (!txs.length) return 0;
    const firstTxTime = parseInt(txs[0].timeStamp, 10);
    const ageYears =
      (Date.now() / 1000 - firstTxTime) / (60 * 60 * 24 * 365);
    return Math.floor(ageYears);
  } catch (err) {
    console.error("Error fetching wallet age:", err);
    return 0;
  }
}

// 2. DAO votes (Snapshot)
async function getDaoVotes(address: string): Promise<number> {
  const query = `
    query Votes($voter: String!) {
      votes(where: { voter: $voter }) {
        id
      }
    }
  `;
  try {
    const res = await axios.post(SNAPSHOT_SUBGRAPH, {
      query,
      variables: { voter: address.toLowerCase() },
    });
    return res.data?.data?.votes?.length || 0;
  } catch (err) {
    console.error("Error fetching DAO votes:", err);
    return 0;
  }
}

// 3. DeFi usage (Uniswap positions)
async function getUniswapPositions(address: string): Promise<number> {
  const query = `
    query GetPositions($user: String!) {
      positions(where: { owner: $user }) {
        id
      }
    }
  `;
  try {
    const res = await axios.post(UNISWAP_SUBGRAPH, {
      query,
      variables: { user: address.toLowerCase() },
    });
    return res.data?.data?.positions?.length || 0;
  } catch (err) {
    console.error("Error fetching Uniswap positions:", err);
    return 0;
  }
}

// ------------------ Reputation Wrapper ------------------

export async function fetchWalletActivity(address: string) {
  const [age, votes, defi] = await Promise.all([
    getWalletAge(address),
    getDaoVotes(address),
    getUniswapPositions(address),
  ]);

  return {
    walletAgeYears: age,
    daoVotes: votes,
    defiInteractions: defi,
  };
}
