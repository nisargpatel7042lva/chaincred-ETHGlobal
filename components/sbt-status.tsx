/* SBT Status Checker Component */
"use client"

import React, { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink,
  Copy
} from "lucide-react"

interface SBTStatusProps {
  onMintClick?: () => void
}

export function SBTStatus({ onMintClick }: SBTStatusProps) {
  const { address, isConnected } = useAccount()
  const [sbtStatus, setSbtStatus] = useState<'checking' | 'none' | 'exists' | 'error'>('checking')
  const [sbtData, setSbtData] = useState<any>(null)

  useEffect(() => {
    if (!address || !isConnected) return
    checkSBTStatus()
  }, [address, isConnected])

  const checkSBTStatus = async () => {
    try {
      setSbtStatus('checking')
      
      // Check localStorage for demo SBT
      const existingSBT = localStorage.getItem(`sbt_${address}`)
      
      if (existingSBT) {
        setSbtData({
          tokenId: existingSBT,
          mintedAt: Date.now(), // In real implementation, get from contract
          transactionHash: existingSBT
        })
        setSbtStatus('exists')
      } else {
        setSbtStatus('none')
      }
    } catch (error) {
      console.error('Error checking SBT status:', error)
      setSbtStatus('error')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please connect your wallet to check SBT status</p>
        </CardContent>
      </Card>
    )
  }

  if (sbtStatus === 'checking') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-muted-foreground">Checking SBT status...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sbtStatus === 'exists' && sbtData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Reputation Passport SBT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              Verified Identity
            </Badge>
            <span className="text-sm text-muted-foreground">
              This wallet has a verified identity SBT
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Token ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{sbtData.tokenId.slice(0, 10)}...</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(sbtData.tokenId)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Transaction:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{sbtData.transactionHash.slice(0, 10)}...</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(sbtData.transactionHash)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Identity Verified</p>
                <p className="text-green-600">
                  This wallet is verified and can participate in DAO voting, 
                  claim airdrops, and access gated features.
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p><strong>Security:</strong> This SBT cannot be transferred and serves as your permanent on-chain identity credential.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sbtStatus === 'none') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-gray-400" />
            No SBT Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-gray-600">
              <XCircle className="w-3 h-3 mr-1" />
              Not Verified
            </Badge>
            <span className="text-sm text-muted-foreground">
              This wallet doesn't have a verified identity SBT
            </span>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-gray-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-800">Identity Not Verified</p>
                <p className="text-gray-600">
                  To participate in DAO voting and claim airdrops, you need to 
                  verify your identity and mint a Reputation Passport SBT.
                </p>
              </div>
            </div>
          </div>

          {onMintClick && (
            <Button onClick={onMintClick} className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Start Verification Process
            </Button>
          )}

          <div className="text-xs text-muted-foreground">
            <p><strong>Benefits of verification:</strong> DAO voting, airdrop eligibility, gated feature access, and building on-chain reputation.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sbtStatus === 'error') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <p className="text-muted-foreground">Error checking SBT status</p>
          </div>
          <Button onClick={checkSBTStatus} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
