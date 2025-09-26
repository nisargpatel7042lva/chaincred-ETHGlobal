/* New: Demo airdrop claim page gated by score */
"use client"

import { WalletConnect } from "@/components/wallet-connect"
import { Gate } from "@/components/gate"
import { Button } from "@/components/ui/button"

export default function AirdropPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-balance">Demo: Airdrop</h1>
        <WalletConnect />
      </div>

      <div className="mt-6">
        <Gate minScore={70}>
          <div className="rounded-lg border p-6 bg-card text-card-foreground">
            <p className="text-sm text-muted-foreground mb-4">You can claim because your score ≥ 70.</p>
            <Button>Claim Tokens</Button>
          </div>
        </Gate>
      </div>
    </main>
  )
}
