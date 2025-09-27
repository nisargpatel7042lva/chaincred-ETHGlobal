/* Sybil Attack Prevention Demo - Shows Why Self Protocol is Essential */
"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Wallet {
  address: string
  reputation: number
  isHuman: boolean
  isVerified: boolean
}

export function SybilDemo() {
  const [scenario, setScenario] = useState<'without' | 'with'>('without')
  const [wallets, setWallets] = useState<Wallet[]>([])

  // Mock data for demonstration
  const generateWallets = (count: number, isHuman: boolean) => {
    const newWallets: Wallet[] = []
    for (let i = 0; i < count; i++) {
      newWallets.push({
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        reputation: Math.floor(Math.random() * 100),
        isHuman,
        isVerified: isHuman
      })
    }
    return newWallets
  }

  const simulateSybilAttack = () => {
    // Generate 100 fake wallets (bots)
    const fakeWallets = generateWallets(100, false)
    // Generate 10 real wallets (humans)
    const realWallets = generateWallets(10, true)
    setWallets([...fakeWallets, ...realWallets])
    setScenario('without')
  }

  const simulateWithSelfProtocol = () => {
    // Generate 100 fake wallets (bots) - but they can't verify identity
    const fakeWallets = generateWallets(100, false).map(w => ({ ...w, isVerified: false }))
    // Generate 10 real wallets (humans) - they can verify identity
    const realWallets = generateWallets(10, true).map(w => ({ ...w, isVerified: true }))
    setWallets([...fakeWallets, ...realWallets])
    setScenario('with')
  }

  const getVotingPower = () => {
    if (scenario === 'without') {
      // Without Self Protocol: All wallets can vote
      return wallets.filter(w => w.reputation >= 50).length
    } else {
      // With Self Protocol: Only verified humans can vote
      return wallets.filter(w => w.reputation >= 50 && w.isVerified).length
    }
  }

  const getAirdropEligibility = () => {
    if (scenario === 'without') {
      // Without Self Protocol: All wallets can claim airdrops
      return wallets.filter(w => w.reputation >= 70).length
    } else {
      // With Self Protocol: Only verified humans can claim airdrops
      return wallets.filter(w => w.reputation >= 70 && w.isVerified).length
    }
  }

  const getManipulationRisk = () => {
    if (scenario === 'without') {
      // High risk: 100 fake wallets vs 10 real wallets
      return 90 // 90% of wallets are fake
    } else {
      // Low risk: Only 10 real wallets can participate
      return 10 // 10% risk (only real wallets)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sybil Attack Prevention Demo</CardTitle>
          <CardDescription>
            See how Self Protocol prevents Sybil attacks in our reputation system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={simulateSybilAttack}
              variant={scenario === 'without' ? 'default' : 'outline'}
            >
              Simulate WITHOUT Self Protocol
            </Button>
            <Button 
              onClick={simulateWithSelfProtocol}
              variant={scenario === 'with' ? 'default' : 'outline'}
            >
              Simulate WITH Self Protocol
            </Button>
          </div>

          {wallets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Voting Power */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">DAO Voting Power</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getVotingPower()}</div>
                  <div className="text-xs text-muted-foreground">
                    Wallets with reputation ≥ 50
                  </div>
                  {scenario === 'with' && (
                    <Badge variant="secondary" className="mt-2">
                      Only verified humans
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Airdrop Eligibility */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Airdrop Eligibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getAirdropEligibility()}</div>
                  <div className="text-xs text-muted-foreground">
                    Wallets with reputation ≥ 70
                  </div>
                  {scenario === 'with' && (
                    <Badge variant="secondary" className="mt-2">
                      Only verified humans
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Manipulation Risk */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Manipulation Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getManipulationRisk()}%</div>
                  <div className="text-xs text-muted-foreground">
                    Risk of system manipulation
                  </div>
                  <Progress 
                    value={getManipulationRisk()} 
                    className="mt-2 h-2"
                  />
                  {scenario === 'with' && (
                    <Badge variant="secondary" className="mt-2">
                      Sybil-resistant
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Explanation */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">
              {scenario === 'without' ? '❌ WITHOUT Self Protocol:' : '✅ WITH Self Protocol:'}
            </h4>
            <ul className="text-sm space-y-1">
              {scenario === 'without' ? (
                <>
                  <li>• 100 fake wallets can vote in DAO governance</li>
                  <li>• 100 fake wallets can claim airdrops</li>
                  <li>• 90% manipulation risk - system is vulnerable</li>
                  <li>• Real users get diluted rewards</li>
                  <li>• Governance decisions are manipulated</li>
                </>
              ) : (
                <>
                  <li>• Only 10 verified humans can vote in DAO governance</li>
                  <li>• Only 10 verified humans can claim airdrops</li>
                  <li>• 10% manipulation risk - system is secure</li>
                  <li>• Real users get fair rewards</li>
                  <li>• Governance decisions are fair</li>
                </>
              )}
            </ul>
          </div>

          {/* Wallet Breakdown */}
          {wallets.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Wallet Breakdown:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Real Humans:</div>
                  <div className="text-green-600">
                    {wallets.filter(w => w.isHuman).length} wallets
                  </div>
                </div>
                <div>
                  <div className="font-medium">Fake Wallets:</div>
                  <div className="text-red-600">
                    {wallets.filter(w => !w.isHuman).length} wallets
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
