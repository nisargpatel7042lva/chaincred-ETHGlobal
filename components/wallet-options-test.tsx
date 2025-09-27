/* Test component to show expected wallet options */
"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useConnections } from "wagmi"

export function WalletOptionsTest() {
  const connections = useConnections()

  return (
    <div className="p-6 border-2 border-green-300 rounded-lg bg-green-50">
      <h3 className="text-lg font-semibold text-green-800 mb-4">
        Expected Wallet Options in ConnectButton:
      </h3>
      
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="font-medium text-green-700">Priority Wallets:</div>
        <div className="text-green-600">MetaMask, Coinbase, Phantom, Backpack</div>
        
        <div className="font-medium text-green-700">Additional Options:</div>
        <div className="text-green-600">WalletConnect, Safe, Injected wallets</div>
        
        <div className="font-medium text-green-700">Current Connections:</div>
        <div className="text-green-600">{connections.length} detected</div>
      </div>
      
      <div className="border border-green-200 p-3 rounded bg-white">
        <ConnectButton />
      </div>
      
      <div className="mt-3 text-xs text-green-600">
        Click the button above to see all available wallet options
      </div>
    </div>
  )
}
