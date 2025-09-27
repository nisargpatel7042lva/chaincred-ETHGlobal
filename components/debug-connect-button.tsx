/* Debug Connect Button - Test if Rainbow Kit is working */
"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { useEffect } from "react"

export function DebugConnectButton() {
  const account = useAccount()

  useEffect(() => {
    console.log("DebugConnectButton mounted")
    console.log("Account state:", account)
  }, [account])

  return (
    <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg">
      <h4 className="font-semibold mb-2">Debug Connect Button</h4>
      <div className="mb-2">
        <strong>Account Status:</strong> {account.isConnected ? "Connected" : "Not Connected"}
      </div>
      <div className="mb-4">
        <strong>Address:</strong> {account.address || "None"}
      </div>
      
      <div className="border border-gray-300 p-2 rounded">
        <ConnectButton />
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        If you don't see a button above, there might be an issue with Rainbow Kit
      </div>
    </div>
  )
}
