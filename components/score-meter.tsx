/* New: Score meter using Recharts RadialBarChart */
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts"

export function ScoreMeter({ score }: { score: number }) {
  const data = [{ name: "score", value: score, fill: "oklch(var(--color-primary))" }]

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-balance">Reputation Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <RadialBarChart
          width={220}
          height={220}
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" background cornerRadius={12} fill="oklch(var(--color-primary))" />
        </RadialBarChart>
        <div className="mt-2 text-3xl font-semibold">{score}</div>
        <p className="text-sm text-muted-foreground">Higher is more trusted</p>
      </CardContent>
    </Card>
  )
}
