/* New: Wallet connect / disconnect button */
"use client"

import { Button } from "@/components/ui/button"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from "wagmi/connectors"
import { toast } from "@/hooks/use-toast"

export function WalletConnect() {
  const { isConnected, address, chain } = useAccount()
  const { connect, isPending: isConnecting, error } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = async () => {
    try {
      await connect({ connector: injected() })
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      })
    } catch (err: any) {
      console.error("Connection error:", err)
      toast({
        title: "Connection Failed",
        description: err?.message || "Failed to connect wallet. Please make sure you have a wallet installed.",
        variant: "destructive",
      })
    }
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <div className="text-xs text-muted-foreground">
            {chain?.name || "Unknown Chain"}
          </div>
        </div>
        <Button variant="secondary" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting}
        className="w-full"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      
      {error && (
        <div className="text-xs text-red-500 text-center">
          {error.message}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground text-center">
        Connect with MetaMask or any injected wallet
      </div>
    </div>
  )
}
