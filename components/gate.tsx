/* New: Gate component to restrict actions by min score */
"use client"

import type { PropsWithChildren } from "react"
import { useAccount } from "wagmi"
import { useReputation } from "@/hooks/use-reputation"
import { Card, CardContent } from "@/components/ui/card"

export function Gate({ minScore, children }: PropsWithChildren<{ minScore: number }>) {
  const { address } = useAccount()
  const { data, isLoading } = useReputation(address)

  if (!address) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">Connect a wallet to continue.</CardContent>
      </Card>
    )
  }

  if (isLoading || !data) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">Checking reputation…</CardContent>
      </Card>
    )
  }

  if (data.score < minScore) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Access denied. Minimum score {minScore} required.
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
