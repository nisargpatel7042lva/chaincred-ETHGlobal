/* New: Wallet connect / disconnect button */
"use client"

import { Button } from "@/components/ui/button"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from "wagmi/connectors"

export function WalletConnect() {
  const { isConnected, address } = useAccount()
  const { connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <Button variant="secondary" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={() => connect({ connector: injected() })} disabled={isConnecting}>
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
