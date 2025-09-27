/* Wallet Detection Component - Shows all available wallets */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DetectedWallet {
  name: string
  id: string
  icon?: string
  isInstalled: boolean
  provider?: any
}

export function WalletDetector() {
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([])

  useEffect(() => {
    const detectWallets = () => {
      const wallets: DetectedWallet[] = []
      
      // Check for specific Ethereum wallet providers you want to see
      const priorityWallets = [
        { name: "MetaMask", id: "metamask", provider: (window as any).ethereum },
        { name: "Coinbase Wallet", id: "coinbase", provider: (window as any).coinbaseWalletExtension },
        { name: "Phantom", id: "phantom", provider: (window as any).phantom },
        { name: "Backpack", id: "backpack", provider: (window as any).backpack },
      ]
      
      // Additional Ethereum wallet providers
      const otherWallets = [
        { name: "Trust Wallet", id: "trust", provider: (window as any).trustwallet },
        { name: "Rabby Wallet", id: "rabby", provider: (window as any).rabby },
        { name: "OKX Wallet", id: "okx", provider: (window as any).okxwallet },
        { name: "Bitget Wallet", id: "bitget", provider: (window as any).bitget },
        { name: "Zerion", id: "zerion", provider: (window as any).zerion },
        { name: "Frame", id: "frame", provider: (window as any).frame },
        { name: "imToken", id: "imtoken", provider: (window as any).imToken },
        { name: "TokenPocket", id: "tokenpocket", provider: (window as any).tokenpocket },
        { name: "1inch Wallet", id: "oneinch", provider: (window as any).oneInch },
        { name: "Rainbow", id: "rainbow", provider: (window as any).rainbow },
        { name: "Brave Wallet", id: "brave", provider: (window as any).braveSolana },
        { name: "Opera Wallet", id: "opera", provider: (window as any).opera },
        { name: "Crypto.com DeFi Wallet", id: "crypto", provider: (window as any).crypto },
        { name: "Binance Chain Wallet", id: "binance", provider: (window as any).BinanceChain },
        { name: "Math Wallet", id: "math", provider: (window as any).mathwallet },
        { name: "SafePal", id: "safepal", provider: (window as any).safepal },
        { name: "Tokenary", id: "tokenary", provider: (window as any).tokenary },
        { name: "Glow", id: "glow", provider: (window as any).glow },
        { name: "Slope", id: "slope", provider: (window as any).slope },
        { name: "Solflare", id: "solflare", provider: (window as any).solflare },
        { name: "Torus", id: "torus", provider: (window as any).torus },
        { name: "WalletConnect", id: "walletconnect", provider: null },
        { name: "Safe Wallet", id: "safe", provider: null },
        { name: "Ledger", id: "ledger", provider: null },
        { name: "Trezor", id: "trezor", provider: null },
      ]
      
      const ethereumWallets = [...priorityWallets, ...otherWallets]

      // Check for generic injected providers
      if ((window as any).ethereum) {
        const ethereum = (window as any).ethereum
        
        // Check if it's a specific wallet
        if (ethereum.isMetaMask) {
          wallets.push({
            name: "MetaMask",
            id: "metamask",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isCoinbaseWallet) {
          wallets.push({
            name: "Coinbase Wallet",
            id: "coinbase",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isRabby) {
          wallets.push({
            name: "Rabby Wallet",
            id: "rabby",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isTrust) {
          wallets.push({
            name: "Trust Wallet",
            id: "trust",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isPhantom) {
          wallets.push({
            name: "Phantom",
            id: "phantom",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isOkxWallet) {
          wallets.push({
            name: "OKX Wallet",
            id: "okx",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isBitgetWallet) {
          wallets.push({
            name: "Bitget Wallet",
            id: "bitget",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isZerion) {
          wallets.push({
            name: "Zerion",
            id: "zerion",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isFrame) {
          wallets.push({
            name: "Frame",
            id: "frame",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isImToken) {
          wallets.push({
            name: "imToken",
            id: "imtoken",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isTokenPocket) {
          wallets.push({
            name: "TokenPocket",
            id: "tokenpocket",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isOneInch) {
          wallets.push({
            name: "1inch Wallet",
            id: "oneinch",
            isInstalled: true,
            provider: ethereum
          })
        } else if (ethereum.isRainbow) {
          wallets.push({
            name: "Rainbow",
            id: "rainbow",
            isInstalled: true,
            provider: ethereum
          })
        } else {
          // Generic injected wallet
          wallets.push({
            name: "Injected Wallet",
            id: "injected",
            isInstalled: true,
            provider: ethereum
          })
        }
      }

      // Check for other specific Ethereum wallet providers
      ethereumWallets.forEach(wallet => {
        if (wallet.provider && !wallets.find(w => w.id === wallet.id)) {
          wallets.push({
            name: wallet.name,
            id: wallet.id,
            isInstalled: true,
            provider: wallet.provider
          })
        } else if (!wallet.provider && !wallets.find(w => w.id === wallet.id)) {
          // Add wallets that don't have specific providers but are supported
          wallets.push({
            name: wallet.name,
            id: wallet.id,
            isInstalled: true,
            provider: null
          })
        }
      })

      setDetectedWallets(wallets)
    }

    detectWallets()
    
    // Re-detect when window loads
    window.addEventListener('load', detectWallets)
    
    return () => {
      window.removeEventListener('load', detectWallets)
    }
  }, [])

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Detected Ethereum Wallets</CardTitle>
        <CardDescription>
          Priority wallets: MetaMask, Coinbase, Phantom, Backpack + other detected wallets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {detectedWallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {wallet.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-xs text-muted-foreground">{wallet.id}</div>
                </div>
              </div>
              <Badge variant={wallet.isInstalled ? "default" : "secondary"}>
                {wallet.isInstalled ? "Available" : "Not Detected"}
              </Badge>
            </div>
          ))}
        </div>
        
        {detectedWallets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No wallets detected. Make sure you have a wallet extension installed.
          </div>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground">
          Total detected: {detectedWallets.length} wallets
        </div>
      </CardContent>
    </Card>
  )
}
