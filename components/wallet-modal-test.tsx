/* Test component to force show wallet options modal */
"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useDisconnect } from "wagmi"

export function WalletModalTest() {
  const account = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <div className="p-6 border-2 border-purple-300 rounded-lg bg-purple-50">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">
        🔍 Wallet Options Modal Test
      </h3>
      
      <div className="mb-4">
        <div className="text-sm text-purple-700">
          <strong>Current Status:</strong> {account.isConnected ? "✅ Connected" : "❌ Not Connected"}
        </div>
        {account.isConnected && (
          <div className="text-sm text-purple-700 mt-1">
            <strong>Connected to:</strong> {account.address}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Disconnect first to see options */}
        {account.isConnected && (
          <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>To see wallet options:</strong> Disconnect first, then click Connect
            </p>
            <button 
              onClick={() => disconnect()}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Disconnect
            </button>
          </div>
        )}
        
        {/* Connect Button */}
        <div className="border border-purple-200 p-4 rounded bg-white">
          <ConnectButton />
        </div>
      </div>
      
      <div className="mt-3 text-xs text-purple-600">
        {account.isConnected 
          ? "You're connected! Disconnect to see wallet options."
          : "Click Connect to see all available wallet options"
        }
      </div>
    </div>
  )
}
