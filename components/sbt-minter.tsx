/* SBT Minter Component */
"use client"

import React, { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Loader2, CheckCircle, AlertCircle } from "lucide-react"

// SBT Contract ABI
const SBT_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mintSBT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "mintReputationPassport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

interface SBTMinterProps {
  isEnabled: boolean
  verificationData?: any
  onMintSuccess?: () => void
}

export function SBTMinter({ isEnabled, verificationData, onMintSuccess }: SBTMinterProps) {
  const { address, isConnected } = useAccount()
  const [isMinting, setIsMinting] = useState(false)
  
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleMintSBT = async () => {
    if (!address || !isEnabled) return
    
    setIsMinting(true)
    try {
      // Use the ReputationPassport contract address
      const contractAddress = '0x1234567890123456789012345678901234567890' // Mock address
      
      // Generate metadata URI based on verification data
      const metadataURI = `https://chaincred.vercel.app/api/metadata/${address}?verified=true&timestamp=${Date.now()}`
      
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: SBT_CONTRACT_ABI,
        functionName: 'mintReputationPassport',
        args: [address],
      })
    } catch (err) {
      console.error('SBT minting failed:', err)
    } finally {
      setIsMinting(false)
    }
  }

  // Call onMintSuccess when minting is confirmed
  React.useEffect(() => {
    if (isConfirmed && onMintSuccess) {
      onMintSuccess()
    }
  }, [isConfirmed, onMintSuccess])

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please connect your wallet first</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Mint Reputation Passport SBT
        </CardTitle>
        <CardDescription>
          {isEnabled 
            ? "Your identity has been verified! Mint your Reputation Passport SBT."
            : "Complete identity verification to enable SBT minting."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Ready to Mint" : "Verification Required"}
          </Badge>
        </div>

        {/* Wallet Address */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Wallet:</span>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </code>
        </div>

        {/* Mint Button */}
        <Button 
          onClick={handleMintSBT}
          disabled={!isEnabled || isPending || isConfirming || isMinting}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          {(isPending || isConfirming || isMinting) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Minting...'}
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4 mr-2" />
              {isEnabled ? 'Mint SBT' : 'Verification Required'}
            </>
          )}
        </Button>

        {/* Success State */}
        {isConfirmed && (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">SBT Minted Successfully!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Your Reputation Passport SBT has been minted to your wallet.
            </p>
            {hash && (
              <p className="text-xs text-green-600 mt-2">
                Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
              </p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Minting Failed</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              {error.message}
            </p>
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>What is an SBT?</strong> A Soulbound Token (SBT) is a non-transferable NFT that represents your verified identity and reputation. It cannot be sold or transferred to others.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
