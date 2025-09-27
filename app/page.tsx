/* Ethereum Reputation Passport - Clear Step-by-Step Flow */
import React from "react"
import { WalletConnect } from "@/components/wallet-connect"
import { ScoreClientPanel } from "./score-client-panel"
import { IdentityVerification } from "@/components/identity-verification"
import { SelfProtocolVerification } from "@/components/self-protocol-verification"
import { SybilDemo } from "@/components/sybil-demo"
import { ScoringExplanation } from "@/components/scoring-explanation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Shield, Users, Gift, Lock } from "lucide-react"

export default function HomePage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
          Ethereum Reputation Passport
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Get your trust score, verify your identity, and access Web3 features
        </p>
        <div className="flex justify-center">
          <WalletConnect />
        </div>
      </header>

      {/* Step-by-Step Flow */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <CardTitle className="text-lg">Connect Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect your Ethereum wallet to get started
              </p>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <CardTitle className="text-lg">Get Reputation Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We analyze your on-chain activity to calculate your trust score
              </p>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <CardTitle className="text-lg">Verify Identity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Prove you're a real human with Self Protocol (privacy-preserving)
              </p>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <CardTitle className="text-lg">Access Features</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Vote in DAOs, claim airdrops, and access premium DeFi features
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content - Interactive Flow */}
      <section className="grid gap-8 lg:grid-cols-2 mb-12">
        {/* Left Column - Your Reputation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Your Reputation Score
              </CardTitle>
              <CardDescription>
                Based on your on-chain activity: wallet age, DAO votes, DeFi transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreClientPanel />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Identity Verification
              </CardTitle>
              <CardDescription>
                Prove you're a real human with Self Protocol and zero-knowledge proofs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SelfProtocolVerification />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - What You Can Access */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                DAO Voting Access
              </CardTitle>
              <CardDescription>
                Only verified humans with good reputation can vote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Minimum Score Required:</span>
                  <Badge variant="secondary">30/100</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Identity Verification:</span>
                  <Badge variant="secondary">Required</Badge>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Prevents Sybil attacks in governance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Airdrop Eligibility
              </CardTitle>
              <CardDescription>
                Only verified humans can claim token airdrops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Minimum Score Required:</span>
                  <Badge variant="secondary">50/100</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Identity Verification:</span>
                  <Badge variant="secondary">Required</Badge>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Prevents airdrop farming with fake wallets
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Premium DeFi Access
              </CardTitle>
              <CardDescription>
                Get better terms with verified reputation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reduced Collateral:</span>
                  <Badge variant="secondary">Up to 50%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lower Fees:</span>
                  <Badge variant="secondary">Up to 30%</Badge>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ✅ Trusted users get better DeFi terms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Why This Matters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prevents Sybil Attacks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Only verified humans can participate in governance and claim rewards, preventing manipulation by fake wallets.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fair Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Airdrops and rewards go to real users, not bots or farmers with multiple wallets.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Privacy-Preserving</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Zero-knowledge proofs verify your identity without revealing personal information.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Scoring Explanation */}
      <section className="mb-12">
        <ScoringExplanation />
      </section>

      {/* Interactive Demo */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">See It In Action</h2>
        <SybilDemo />
      </section>
    </main>
  )
}
