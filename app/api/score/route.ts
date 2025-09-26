/* New: Score API (heuristic + AI explanation via Vercel AI SDK) */
import { NextResponse } from "next/server"
import { pseudoScore, combineScore } from "@/lib/scoring"
import { generateText } from "ai"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const address = (searchParams.get("address") || "").toLowerCase()

  if (!address || !address.startsWith("0x") || address.length < 10) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 })
  }

  const breakdown = pseudoScore(address)
  const score = combineScore(breakdown)

  // Minimal AI explanation using the AI SDK
  const { text: explanation } = await generateText({
    model: "openai/gpt-5-mini",
    prompt: [
      "You are generating a concise, friendly explanation for a wallet's reputation score.",
      `Wallet: ${address}`,
      `Signals: walletAge=${breakdown.walletAge}, daoVotes=${breakdown.daoVotes}, defiTxs=${breakdown.defiTxs}`,
      `Score: ${score}`,
      "Explain the score in 2-3 sentences, referencing each signal. Avoid speculation.",
    ].join("\n"),
  })

  return NextResponse.json({
    address,
    score,
    breakdown,
    explanation,
  })
}
