/* Enhanced Client panel with 0G AI analysis */
"use client"

import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useReputation } from "@/hooks/use-reputation"
import { ScoreMeter } from "@/components/score-meter"
import { SbtMintCard } from "@/components/sbt-mint-card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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
      
      {/* 0G AI Analysis Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-balance">0G AI Analysis</CardTitle>
            {data.confidence && (
              <Badge variant="secondary" className="text-xs">
                Confidence: {Math.round(data.confidence * 100)}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm whitespace-pre-wrap">{data.explanation}</p>
          
          {/* Confidence Indicator */}
          {data.confidence && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Analysis Confidence</span>
                <span>{Math.round(data.confidence * 100)}%</span>
              </div>
              <Progress value={data.confidence * 100} className="h-2" />
            </div>
          )}
          
          {/* Reasoning */}
          {data.reasoning && data.reasoning.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Analysis Reasoning:</h4>
              <ul className="space-y-1">
                {data.reasoning.map((reason, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommendations:</h4>
              <ul className="space-y-1">
                {data.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-500 mt-1">→</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Data Source and Signals */}
          <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
            <div className="flex justify-between items-center">
              <span><strong>Data Source:</strong> {(data as any).dataSource || "The Graph + 0G AI"}</span>
              {data.timestamp && (
                <span>Updated: {new Date(data.timestamp).toLocaleTimeString()}</span>
              )}
            </div>
            <div>
              <strong>Real On-chain Signals:</strong> Wallet Age {data.breakdown?.walletAge || 0} days, 
              DAO Votes {data.breakdown?.daoVotes || 0}, DeFi Transactions {data.breakdown?.defiTxs || 0}
              {data.breakdown?.totalTxs && `, Total Transactions ${data.breakdown.totalTxs}`}
              {data.breakdown?.uniqueContracts && `, Unique Contracts ${data.breakdown.uniqueContracts}`}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <SbtMintCard eligible={eligible} score={data.score} />
    </div>
  )
}
