/* Simple Wallet Connect Button - Backup Component */
"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export function SimpleWalletConnect() {
  const { isConnected, address, chain } = useAccount()

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Simple Connect Button */}
      <ConnectButton />
      
      {/* Connected Info */}
      {isConnected && (
        <div className="text-center space-y-2">
          <div className="flex items-center gap-2 text-green-600">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">Connected</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {address?.slice(0, 6)}...{address?.slice(-4)} • {chain?.name}
          </div>
        </div>
      )}
    </div>
  )
}
