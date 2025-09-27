/* Simple Wallet Connect Button - Rainbow Kit */
"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

export function WalletConnect() {
  const { isConnected, address } = useAccount()

  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectButton />
      {isConnected && (
        <div className="text-sm text-muted-foreground">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
      )}
    </div>
  )
}