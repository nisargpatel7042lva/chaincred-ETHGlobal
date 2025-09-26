/* New: Hypergraph dashboard panel (stubbed) */
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HypergraphPanel() {
  const [dao, setDao] = useState("demo.dao.eth")
  const [results, setResults] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function onQuery() {
    setLoading(true)
    try {
      // TODO: Replace with real Hypergraph + GRC-20-ts query
      await new Promise((r) => setTimeout(r, 800))
      setResults(["0x1111...aA11", "0x2222...bB22", "0x3333...cC33"])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-balance">Hypergraph Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={dao} onChange={(e) => setDao(e.target.value)} placeholder="DAO name or ENS" />
          <Button onClick={onQuery} disabled={loading}>
            {loading ? "Querying…" : "Query"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Try: “Show all trusted wallets for DAO X”</p>
        {results && (
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium mb-2">Trusted wallets for {dao}:</div>
            <ul className="list-disc pl-5 space-y-1">
              {results.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
