'use client'
import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Users, TrendingUp, Shield, Clock, Activity } from "lucide-react"

export function ScoringExplanation() {
  const [expandedPath, setExpandedPath] = useState<string | null>(null)

  const scoringPaths = [
    {
      id: "traditional",
      name: "Traditional Path",
      icon: <Clock className="w-5 h-5" />,
      description: "For established users with long history",
      maxScore: 100,
      requirements: [
        { factor: "Wallet Age", weight: "30 points", description: "1 year = 30 points" },
        { factor: "DAO Votes", weight: "25 points", description: "10 votes = 25 points" },
        { factor: "DeFi Transactions", weight: "25 points", description: "10 txs = 25 points" },
        { factor: "Total Transactions", weight: "20 points", description: "100 txs = 20 points" },
      ]
    },
    {
      id: "newuser",
      name: "New User Path",
      icon: <Users className="w-5 h-5" />,
      description: "For recent wallets with high activity",
      maxScore: 95,
      requirements: [
        { factor: "DeFi Activity", weight: "70 points", description: "17 txs = 70 points" },
        { factor: "Recent Activity", weight: "15 points", description: "Activity in last 7 days" },
        { factor: "New User Boost", weight: "10 points", description: "Wallet < 90 days old" },
      ]
    },
    {
      id: "community",
      name: "Community Path",
      icon: <Shield className="w-5 h-5" />,
      description: "For active DAO participants",
      maxScore: 100,
      requirements: [
        { factor: "DAO Participation", weight: "50 points", description: "5 votes = 50 points" },
        { factor: "Contract Diversity", weight: "25 points", description: "10 contracts = 25 points" },
        { factor: "Wallet Age", weight: "25 points", description: "50 days = 25 points" },
      ]
    },
    {
      id: "defi",
      name: "DeFi Specialist Path",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "For heavy DeFi users",
      maxScore: 100,
      requirements: [
        { factor: "DeFi Transactions", weight: "50 points", description: "10 txs = 50 points" },
        { factor: "Contract Diversity", weight: "25 points", description: "8 contracts = 25 points" },
        { factor: "Transaction Volume", weight: "15 points", description: "50 txs = 15 points" },
        { factor: "Wallet Age", weight: "10 points", description: "50 days = 10 points" },
      ]
    }
  ]

  const fairnessFeatures = [
    {
      title: "Minimum Score Guarantee",
      description: "Any wallet with activity gets at least 30 points",
      icon: <Shield className="w-4 h-4" />
    },
    {
      title: "New User Boost",
      description: "New active users get +20 points bonus",
      icon: <Users className="w-4 h-4" />
    },
    {
      title: "Recent Activity Bonus",
      description: "Active in last 3 days gets +5 points",
      icon: <Activity className="w-4 h-4" />
    },
    {
      title: "Long-term User Bonus",
      description: "1+ year old wallets get +15 points",
      icon: <Clock className="w-4 h-4" />
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          How Reputation Scoring Works
        </CardTitle>
        <CardDescription>
          Fair scoring with multiple paths to ensure no legitimate user is excluded
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fairness Features */}
        <div>
          <h4 className="font-semibold mb-3">Fairness Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fairnessFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                {feature.icon}
                <div>
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring Paths */}
        <div>
          <h4 className="font-semibold mb-3">Scoring Paths (We Take the Highest)</h4>
          <div className="space-y-3">
            {scoringPaths.map((path) => (
              <Card key={path.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {path.icon}
                      <div>
                        <CardTitle className="text-base">{path.name}</CardTitle>
                        <CardDescription className="text-sm">{path.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Max {path.maxScore}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
                      >
                        {expandedPath === path.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedPath === path.id && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {path.requirements.map((req, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{req.factor}</div>
                            <div className="text-xs text-muted-foreground">{req.description}</div>
                          </div>
                          <Badge variant="outline">{req.weight}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Access Requirements */}
        <div>
          <h4 className="font-semibold mb-3">Access Requirements</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="font-medium text-sm mb-2">DAO Voting</div>
              <div className="text-xs text-muted-foreground mb-2">Score ≥ 30 + Identity Verified</div>
              <Badge variant="secondary" className="text-xs">Easy Access</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="font-medium text-sm mb-2">Airdrop Eligibility</div>
              <div className="text-xs text-muted-foreground mb-2">Score ≥ 50 + Identity Verified</div>
              <Badge variant="secondary" className="text-xs">Moderate</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="font-medium text-sm mb-2">Premium DeFi</div>
              <div className="text-xs text-muted-foreground mb-2">Score ≥ 60 + Identity Verified</div>
              <Badge variant="secondary" className="text-xs">Advanced</Badge>
            </div>
          </div>
        </div>

        {/* Example Scenarios */}
        <div>
          <h4 className="font-semibold mb-3">Example Scenarios</h4>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-sm">New User (30 days old)</div>
              <div className="text-xs text-muted-foreground">
                5 DeFi transactions + 1 DAO vote + recent activity = <strong>Score: 45</strong>
              </div>
              <div className="text-xs text-green-600 mt-1">✅ Can vote in DAOs, eligible for airdrops</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-sm">Active DAO Member (6 months old)</div>
              <div className="text-xs text-muted-foreground">
                3 DAO votes + 2 DeFi transactions + contract diversity = <strong>Score: 55</strong>
              </div>
              <div className="text-xs text-green-600 mt-1">✅ Full access to all features</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-sm">DeFi Power User (1 year old)</div>
              <div className="text-xs text-muted-foreground">
                20 DeFi transactions + 10 unique contracts + high volume = <strong>Score: 85</strong>
              </div>
              <div className="text-xs text-green-600 mt-1">✅ Premium access with best terms</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
