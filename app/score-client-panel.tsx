/* New: Client panel to fetch and show score + mint UI */
"use client"

import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useReputation } from "@/hooks/use-reputation"
import { ScoreMeter } from "@/components/score-meter"
import { SbtMintCard } from "@/components/sbt-mint-card"

export function ScoreClientPanel() {
  const { address } = useAccount()
  const { data, isLoading, error } = useReputation(address)

  if (!address) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connect a wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Connect your wallet to see your reputation score.</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive-foreground">Failed to load score.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading score…</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Fetching on-chain signals…</p>
        </CardContent>
      </Card>
    )
  }

  const eligible = data.score >= 70

  return (
    <div className="flex flex-col gap-6">
      <ScoreMeter score={data.score} />
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Why this score?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm whitespace-pre-wrap">{data.explanation}</p>
          <div className="text-xs text-muted-foreground">
            Signals: Wallet Age {data.breakdown.walletAge}, DAO Votes {data.breakdown.daoVotes}, DeFi Tx{" "}
            {data.breakdown.defiTxs}
          </div>
        </CardContent>
      </Card>
      <SbtMintCard eligible={eligible} score={data.score} />
    </div>
  )
}
