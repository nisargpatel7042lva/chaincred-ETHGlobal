/* Comprehensive Ethereum Wallet Detector */
"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Smartphone,
  Monitor
} from "lucide-react"

interface DetectedWallet {
  name: string
  id: string
  icon: string
  installed: boolean
  type: 'browser' | 'mobile' | 'hardware'
  description: string
  downloadUrl?: string
}

export function WalletDetector() {
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([])
  const [isDetecting, setIsDetecting] = useState(true)

  useEffect(() => {
    detectWallets()
  }, [])

  const detectWallets = () => {
    setIsDetecting(true)
    
    // List of all major Ethereum wallets
    const allWallets: DetectedWallet[] = [
      {
        name: "MetaMask",
        id: "metamask",
        icon: "🦊",
        installed: !!(window as any).ethereum?.isMetaMask,
        type: "browser",
        description: "The most popular Ethereum wallet",
        downloadUrl: "https://metamask.io/download/"
      },
      {
        name: "Phantom",
        id: "phantom",
        icon: "👻",
        installed: !!(window as any).phantom?.ethereum,
        type: "browser",
        description: "Multi-chain wallet with Ethereum support",
        downloadUrl: "https://phantom.app/download"
      },
      {
        name: "Backpack",
        id: "backpack",
        icon: "🎒",
        installed: !!(window as any).backpack,
        type: "browser",
        description: "Solana and Ethereum wallet",
        downloadUrl: "https://backpack.app/download"
      },
      {
        name: "Coinbase Wallet",
        id: "coinbase",
        icon: "🔷",
        installed: !!(window as any).ethereum?.isCoinbaseWallet,
        type: "browser",
        description: "Coinbase's official wallet",
        downloadUrl: "https://www.coinbase.com/wallet"
      },
      {
        name: "Trust Wallet",
        id: "trust",
        icon: "🛡️",
        installed: !!(window as any).ethereum?.isTrust,
        type: "browser",
        description: "Multi-chain mobile wallet",
        downloadUrl: "https://trustwallet.com/download"
      },
      {
        name: "Rabby Wallet",
        id: "rabby",
        icon: "🐰",
        installed: !!(window as any).ethereum?.isRabby,
        type: "browser",
        description: "DeFi-focused wallet",
        downloadUrl: "https://rabby.io/download"
      },
      {
        name: "Brave Wallet",
        id: "brave",
        icon: "🦁",
        installed: !!(window as any).ethereum?.isBraveWallet,
        type: "browser",
        description: "Built into Brave browser",
        downloadUrl: "https://brave.com/wallet/"
      },
      {
        name: "Opera Wallet",
        id: "opera",
        icon: "🎭",
        installed: !!(window as any).ethereum?.isOpera,
        type: "browser",
        description: "Built into Opera browser",
        downloadUrl: "https://www.opera.com/crypto"
      },
      {
        name: "Frame",
        id: "frame",
        icon: "🖼️",
        installed: !!(window as any).ethereum?.isFrame,
        type: "browser",
        description: "Privacy-focused wallet",
        downloadUrl: "https://frame.sh/"
      },
      {
        name: "Tally",
        id: "tally",
        icon: "📊",
        installed: !!(window as any).ethereum?.isTally,
        type: "browser",
        description: "Community-owned wallet",
        downloadUrl: "https://tally.cash/"
      },
      {
        name: "Rainbow",
        id: "rainbow",
        icon: "🌈",
        installed: !!(window as any).ethereum?.isRainbow,
        type: "browser",
        description: "Beautiful Ethereum wallet",
        downloadUrl: "https://rainbow.me/download"
      },
      {
        name: "Zerion",
        id: "zerion",
        icon: "⚡",
        installed: !!(window as any).ethereum?.isZerion,
        type: "browser",
        description: "DeFi portfolio manager",
        downloadUrl: "https://zerion.io/download"
      },
      {
        name: "TokenPocket",
        id: "tokenpocket",
        icon: "🎯",
        installed: !!(window as any).ethereum?.isTokenPocket,
        type: "browser",
        description: "Multi-chain wallet",
        downloadUrl: "https://www.tokenpocket.pro/download"
      },
      {
        name: "OKX Wallet",
        id: "okx",
        icon: "🟠",
        installed: !!(window as any).okxwallet,
        type: "browser",
        description: "OKX exchange wallet",
        downloadUrl: "https://www.okx.com/web3"
      },
      {
        name: "Bitget Wallet",
        id: "bitget",
        icon: "🟡",
        installed: !!(window as any).bitkeep,
        type: "browser",
        description: "Bitget exchange wallet",
        downloadUrl: "https://web3.bitget.com/"
      }
    ]

    // Check for generic injected wallets
    if ((window as any).ethereum && !allWallets.some(w => w.installed)) {
      allWallets.push({
        name: "Injected Wallet",
        id: "injected",
        icon: "💉",
        installed: true,
        type: "browser",
        description: "Unknown injected wallet"
      })
    }

    setDetectedWallets(allWallets)
    setIsDetecting(false)
  }

  const installedWallets = detectedWallets.filter(w => w.installed)
  const availableWallets = detectedWallets.filter(w => !w.installed)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'browser':
        return <Monitor className="w-4 h-4" />
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'hardware':
        return <Wallet className="w-4 h-4" />
      default:
        return <Wallet className="w-4 h-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'browser':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Browser</Badge>
      case 'mobile':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Mobile</Badge>
      case 'hardware':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Hardware</Badge>
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (isDetecting) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground">Detecting wallets...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Detection Summary
          </CardTitle>
          <CardDescription>
            Detected wallets in your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{installedWallets.length}</div>
              <div className="text-sm text-muted-foreground">Installed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{availableWallets.length}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{detectedWallets.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installed Wallets */}
      {installedWallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Installed Wallets ({installedWallets.length})
            </CardTitle>
            <CardDescription>
              Wallets detected in your browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {installedWallets.map((wallet) => (
                <div key={wallet.id} className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold">{wallet.name}</h3>
                      <p className="text-sm text-muted-foreground">{wallet.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {getTypeBadge(wallet.type)}
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Installed
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Wallets */}
      {availableWallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Available Wallets ({availableWallets.length})
            </CardTitle>
            <CardDescription>
              Wallets you can install
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableWallets.map((wallet) => (
                <div key={wallet.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold">{wallet.name}</h3>
                      <p className="text-sm text-muted-foreground">{wallet.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {getTypeBadge(wallet.type)}
                    {wallet.downloadUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(wallet.downloadUrl, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Install
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <Button onClick={detectWallets} variant="outline">
          <Wallet className="w-4 h-4 mr-2" />
          Refresh Detection
        </Button>
      </div>
    </div>
  )
}