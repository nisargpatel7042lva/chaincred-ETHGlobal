/* MetaMask Test Component */
"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

export function MetaMaskTest() {
  const account = useAccount()

  return (
    <div className="p-6 border-2 border-blue-300 rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">
        🦊 MetaMask Connection Test
      </h3>
      
      <div className="mb-4">
        <div className="text-sm text-blue-700">
          <strong>Status:</strong> {account.isConnected ? "✅ Connected" : "❌ Not Connected"}
        </div>
        {account.isConnected && (
          <div className="text-sm text-blue-700 mt-1">
            <strong>Address:</strong> {account.address}
          </div>
        )}
      </div>
      
      <div className="border border-blue-200 p-4 rounded bg-white">
        <ConnectButton />
      </div>
      
      <div className="mt-3 text-xs text-blue-600">
        Make sure MetaMask is installed and unlocked, then click "Connect Wallet"
      </div>
    </div>
  )
}
