/* Wallet Test Page - Debug wallet detection */
"use client"

import { WalletDetector } from "@/components/wallet-detector"
import { WalletDiagnostics } from "@/components/wallet-diagnostics"
import { WalletConnect } from "@/components/wallet-connect"
import { SimpleConnectButton } from "@/components/simple-connect-button"
import { DebugConnectButton } from "@/components/debug-connect-button"
import { WalletOptionsTest } from "@/components/wallet-options-test"

export default function WalletTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Ethereum Wallet Detection Test</h1>
        <p className="text-muted-foreground">
          Test and debug Ethereum wallet connection issues
        </p>
      </div>

      {/* Wallet Options Test */}
      <WalletOptionsTest />

      {/* Debug Connect Button */}
      <DebugConnectButton />

      {/* Simple Connect Button Test */}
      <SimpleConnectButton />

      {/* Current Wallet Connection */}
      <div className="flex justify-center">
        <WalletConnect />
      </div>

      {/* Diagnostics */}
      <WalletDiagnostics />

      {/* Wallet Detector */}
      <WalletDetector />

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-3">How to Test:</h3>
        <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
          <li>Make sure MetaMask is installed and unlocked</li>
          <li>Check the diagnostics above to see if MetaMask is detected</li>
          <li>Try connecting using the Connect Button</li>
          <li>If MetaMask is not detected, try refreshing the page</li>
          <li>Check the browser console for any errors</li>
        </ol>
      </div>
    </div>
  )
}
