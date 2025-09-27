"use client"

import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScoreMeter } from "@/components/score-meter"
import { SbtMintCard } from "@/components/sbt-mint-card"
import { useReputation } from "@/hooks/use-reputation"

export function ScoreClientPanel() {
  const { address } = useAccount()
  const { data, isLoading, error } = useReputation(address)

  if (!address) {
    return (
      <Card className="w-full">
        <CardHeader><CardTitle>Connect a wallet</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Connect your wallet to see your reputation score.</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Error</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-destructive-foreground">Failed to load score.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader><CardTitle>Loading score…</CardTitle></CardHeader>
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
        <CardHeader className="flex justify-between items-center">
          <CardTitle>0G AI Analysis</CardTitle>
          {data.confidence && (
            <Badge variant="secondary" className="text-xs">Confidence: {Math.round(data.confidence * 100)}%</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm whitespace-pre-wrap">{data.explanation}</p>
          {data.confidence && (
            <>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Analysis Confidence</span>
                <span>{Math.round(data.confidence * 100)}%</span>
              </div>
              <Progress value={data.confidence * 100} className="h-2" />
            </>
          )}
          {data.reasoning?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Analysis Reasoning:</h4>
              <ul className="text-xs text-muted-foreground list-disc list-inside">
                {data.reasoning.map((reason, i) => <li key={i}>{reason}</li>)}
              </ul>
            </div>
          )}
          {data.recommendations?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Recommendations:</h4>
              <ul className="text-xs text-muted-foreground list-disc list-inside">
                {data.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <SbtMintCard score={data.score} />
    </div>
  )
}
