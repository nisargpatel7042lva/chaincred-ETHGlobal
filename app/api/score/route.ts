/* Enhanced Score API with Real The Graph Data + 0G AI Integration */
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
    console.log(`Fetching real reputation data for ${address}...`)
    
    // Get real wallet score using The Graph data
    const { score, breakdown, activity } = await getWalletScore(address)

    // Prepare data for 0G AI analysis
    const walletData: WalletAnalysisData = {
      address,
      score,
      breakdown,
    }

    // Get enhanced AI explanation from 0G
    const aiAnalysis = await zeroGAIService.generateReputationExplanation(walletData)

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
    
    // Fallback response with basic scoring
    return NextResponse.json({
      address,
      score: 0,
      breakdown: {
        walletAge: 0,
        daoVotes: 0,
        defiTxs: 0,
      },
      explanation: "Unable to calculate reputation score at this time. Please try again later.",
      confidence: 0.1,
      reasoning: ["Error occurred during data fetching"],
      recommendations: ["Please ensure the wallet address is valid and try again"],
      timestamp: Date.now(),
      dataSource: "Fallback",
    })
  }
}
