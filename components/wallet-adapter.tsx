/* Wallet Adapter - Rainbow Kit or Thirdweb */
"use client"

import React, { useState } from 'react'
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { ThirdwebWallet } from './thirdweb-wallet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Rainbow, Zap } from "lucide-react"

export function WalletAdapter() {
  const { isConnected, address } = useAccount()
  const [adapter, setAdapter] = useState<'rainbow' | 'thirdweb'>('rainbow')

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Adapter Selection */}
      {!isConnected && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Choose Wallet Adapter</CardTitle>
            <CardDescription className="text-center">
              Select your preferred wallet connection method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={adapter === 'rainbow' ? 'default' : 'outline'}
                onClick={() => setAdapter('rainbow')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Rainbow className="w-6 h-6" />
                <span>Rainbow Kit</span>
              </Button>
              <Button
                variant={adapter === 'thirdweb' ? 'default' : 'outline'}
                onClick={() => setAdapter('thirdweb')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Zap className="w-6 h-6" />
                <span>Thirdweb</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Connection */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {adapter === 'rainbow' ? 'Rainbow Kit' : 'Thirdweb'} Wallet
          </CardTitle>
          <CardDescription>
            Connect your wallet using {adapter === 'rainbow' ? 'Rainbow Kit' : 'Thirdweb'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {adapter === 'rainbow' ? (
            <ConnectButton />
          ) : (
            <ThirdwebWallet />
          )}
        </CardContent>
      </Card>

      {/* Connected State */}
      {isConnected && (
        <Card className="w-full max-w-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Connected</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {adapter === 'rainbow' ? 'Rainbow Kit' : 'Thirdweb'}
              </Badge>
            </div>
            <div className="mt-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
