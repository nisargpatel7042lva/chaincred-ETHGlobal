/* New: Dashboard page containing Hypergraph panel (stub) */
import { WalletConnect } from "@/components/wallet-connect"
import { HypergraphPanel } from "@/components/dashboard/hypergraph-panel"

export default function DashboardPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold text-balance">Reputation Dashboard</h1>
        <WalletConnect />
      </div>
      <section className="mt-8">
        <HypergraphPanel />
      </section>
    </main>
  )
}
