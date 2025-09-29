/* Mock SBT Minter Component - For Demo Purposes */
"use client"

import React, { useState } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  Coins,
  Lock,
  Sparkles
} from "lucide-react"

interface MockSBTMinterProps {
  isVerificationComplete: boolean
  verificationData?: any
  onMintSuccess?: (txHash: string) => void
}

export function MockSBTMinter({ 
  isVerificationComplete, 
  verificationData,
  onMintSuccess 
}: MockSBTMinterProps) {
  const { address, isConnected } = useAccount()
  const [isMinting, setIsMinting] = useState(false)
  const [mintStatus, setMintStatus] = useState<'idle' | 'minting' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string>('')

  const handleMintSBT = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    if (!isVerificationComplete) {
      alert('Please complete identity verification first')
      return
    }

    setIsMinting(true)
    setMintStatus('minting')

    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      setTxHash(mockTxHash)
      setMintStatus('success')
      
      if (onMintSuccess) {
        onMintSuccess(mockTxHash)
      }
      
      console.log('🎉 Mock SBT minted successfully!', {
        address,
        txHash: mockTxHash,
        verificationData
      })
      
    } catch (error) {
      console.error('Mock SBT minting failed:', error)
      setMintStatus('error')
    } finally {
      setIsMinting(false)
    }
  }

  const getStatusIcon = () => {
    switch (mintStatus) {
      case 'minting':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (mintStatus) {
      case 'minting':
        return 'Minting SBT...'
      case 'success':
        return 'SBT Minted Successfully!'
      case 'error':
        return 'Minting Failed'
      default:
        return 'Ready to Mint'
    }
  }

  const getStatusColor = () => {
    switch (mintStatus) {
      case 'minting':
        return 'bg-blue-500'
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Sparkles className="h-8 w-8 text-purple-500 mr-2" />
          <CardTitle className="text-xl">Mock SBT Minter</CardTitle>
        </div>
        <Badge variant="outline" className="text-xs">
          Demo Mode - No Real Contracts
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Wallet Connected</span>
          <div className="flex items-center">
            {isConnected ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className="text-xs text-gray-600">
              {isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>

        {/* Verification Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Identity Verified</span>
          <div className="flex items-center">
            {isVerificationComplete ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className="text-xs text-gray-600">
              {isVerificationComplete ? 'Verified' : 'Not Verified'}
            </span>
          </div>
        </div>

        {/* Minting Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Minting Status</span>
            <div className="flex items-center">
              {getStatusIcon()}
              <span className="text-xs text-gray-600 ml-1">
                {getStatusText()}
              </span>
            </div>
          </div>
          
          {mintStatus === 'minting' && (
            <Progress value={66} className="w-full" />
          )}
        </div>

        {/* Transaction Hash */}
        {txHash && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center mb-1">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm font-medium text-green-800">Transaction Hash</span>
            </div>
            <code className="text-xs text-green-700 break-all">
              {txHash}
            </code>
          </div>
        )}

        {/* Mint Button */}
        <Button
          onClick={handleMintSBT}
          disabled={!isConnected || !isVerificationComplete || isMinting}
          className="w-full"
          size="lg"
        >
          {isMinting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Minting SBT...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Mint Reputation SBT
            </>
          )}
        </Button>

        {/* Demo Notice */}
        <div className="p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center mb-1">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium text-yellow-800">Demo Mode</span>
          </div>
          <p className="text-xs text-yellow-700">
            This is a mock SBT minter for demonstration purposes. 
            No real contracts are deployed or transactions sent.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

