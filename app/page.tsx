/* New: Landing page – connect wallet, show score + explanation, mint SBT */
import { WalletConnect } from "@/components/wallet-connect"
import { ScoreClientPanel } from "./score-client-panel"

export default function HomePage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold text-balance">Ethereum Reputation Passport</h1>
        <WalletConnect />
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <ScoreClientPanel />
        <div className="rounded-lg border p-6 bg-card text-card-foreground">
          <h2 className="text-xl font-semibold text-balance">What is this?</h2>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            We compute a trust score from on-chain signals (wallet age, DAO votes, DeFi transactions). If your score is
            high enough, you can mint a non-transferable SBT as your Reputation Passport and use it to access DAO voting
            and airdrops.
          </p>
          <ul className="mt-4 list-disc pl-5 text-sm">
            <li>Sybil resistance</li>
            <li>DAO voting access</li>
            <li>Airdrop eligibility gating</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
