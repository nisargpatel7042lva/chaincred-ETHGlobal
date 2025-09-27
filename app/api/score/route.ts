// app/api/score/route.ts
import { NextResponse } from "next/server"
import { getWalletScore } from "@/lib/scoring"
import { zeroGAIService, type WalletAnalysisData } from "@/lib/zero-g-ai"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const address = (searchParams.get("address") || "").toLowerCase()

  if (!address || !address.startsWith("0x") || address.length < 10) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 })
  }

  try {
    // Step 1: Calculate real on-chain score
    const { score, breakdown, activity } = await getWalletScore(address)

    // Step 2: Prepare AI input
    const walletData: WalletAnalysisData = {
      address,
      score,
      breakdown,
    }

    // Step 3: Get 0G AI enhanced analysis
    const aiAnalysis = await zeroGAIService.generateReputationExplanation(walletData)

    // Step 4: Return combined response
    return NextResponse.json({
      address,
      score,
      breakdown,
      activity,
      explanation: aiAnalysis.explanation,
      confidence: aiAnalysis.confidence,
      reasoning: aiAnalysis.reasoning,
      recommendations: aiAnalysis.recommendations,
      timestamp: Date.now(),
      dataSource: "The Graph + 0G AI",
    })
  } catch (error) {
    console.error("Score API error:", error)

    // Fallback if The Graph or 0G fails
    return NextResponse.json({
      address,
      score: 0,
      breakdown: { walletAge: 0, daoVotes: 0, defiTxs: 0 },
      explanation: "Unable to calculate reputation score at this time.",
      confidence: 0.1,
      reasoning: ["Error during data fetching"],
      recommendations: ["Check wallet address and try again"],
      timestamp: Date.now(),
      dataSource: "Fallback",
    })
  }
}
