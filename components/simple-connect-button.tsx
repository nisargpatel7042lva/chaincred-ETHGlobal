/* Simple Rainbow Kit Connect Button for Testing */
"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"

export function SimpleConnectButton() {
  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Rainbow Kit Connect Button</h3>
      <ConnectButton />
      <p className="text-sm text-muted-foreground text-center">
        Click the button above to see all available Ethereum wallets
      </p>
    </div>
  )
}
