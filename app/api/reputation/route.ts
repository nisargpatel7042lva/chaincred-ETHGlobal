import { NextApiRequest, NextApiResponse } from "next";
import { graphClients, GET_VOTES, GET_POSITIONS, GET_COMPOUND_ACCOUNT } from "@/lib/graphClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "Missing wallet address" });
  }

  try {
    const user = address.toLowerCase();
    let score = 0;

    // 1. Snapshot votes
    const votesData = await graphClients.snapshot.request(GET_VOTES, { voter: user });
    if (votesData.votes.length > 0) score += 20;

    // 2. Uniswap positions
    const uniData = await graphClients.uniswap.request(GET_POSITIONS, { user });
    if (uniData.positions.length > 0) score += 20;

    // 3. Compound activity
    const compData = await graphClients.compound.request(GET_COMPOUND_ACCOUNT, { id: user });
    if (compData.account) score += 20;

    res.status(200).json({
      address,
      score,
      breakdown: {
        daoVotes: votesData.votes.length,
        uniswapPositions: uniData.positions.length,
        compound: !!compData.account,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Graph query failed", details: err.message });
  }
}
