/* Rainbow Kit Wallet Connect Button */
"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useConnections } from "wagmi"

export function WalletConnect() {
  const { isConnected, address, chain } = useAccount()
  const connections = useConnections()

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Simple Connect Button */}
      <ConnectButton />
      
      {/* Connected State Display */}
      {isConnected && (
        <div className="text-center">
          <div className="text-sm font-medium">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <div className="text-xs text-muted-foreground">
            {chain?.name || "Unknown Chain"}
          </div>
        </div>
      )}
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground text-center">
          Available connections: {connections.length}
        </div>
      )}
    </div>
  )
}
