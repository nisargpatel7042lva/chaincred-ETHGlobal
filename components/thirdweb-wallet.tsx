/* Thirdweb Wallet Connect Component */
"use client"

import React from 'react'
import { ThirdwebProvider, ConnectWallet } from "@thirdweb-dev/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

// Thirdweb configuration
const activeChain = "ethereum"

export function ThirdwebWallet() {
  return (
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "demo"}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Thirdweb Wallet
          </CardTitle>
          <CardDescription>
            Connect your wallet using Thirdweb
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <ConnectWallet
            theme="light"
            modalSize="compact"
            welcomeScreen={{
              title: "Connect to ChainCred",
              subtitle: "Connect your wallet to start verification",
            }}
            modalTitle="Connect Wallet"
            modalTitleIcon=""
          />
        </CardContent>
      </Card>
    </ThirdwebProvider>
  )
}
