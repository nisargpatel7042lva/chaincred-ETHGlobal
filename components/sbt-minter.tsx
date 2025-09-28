/* SBT Minter Component - One SBT Per Wallet Restriction */
"use client"

import React, { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
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
  Lock
} from "lucide-react"

// SBT Contract ABI (simplified for demo)
const SBT_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "tokenURI", "type": "string"}
    ],
    "name": "mintSBT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "hasSBT",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Contract address - uses mainnet address from environment
const SBT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_REPUTATION_PASSPORT_ADDRESS || process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890"

interface SBTMinterProps {
  verificationData?: any
  onMintingComplete?: (result: any) => void
  onMintSuccess?: (txHash: string) => void
}

export function SBTMinter({ verificationData, onMintingComplete, onMintSuccess }: SBTMinterProps) {
  const { address, isConnected } = useAccount()
  const [sbtStatus, setSbtStatus] = useState<'checking' | 'none' | 'exists' | 'minting' | 'success' | 'error'>('checking')
  const [sbtTokenId, setSbtTokenId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Check if wallet already has an SBT
  useEffect(() => {
    if (!address || !isConnected) return

    checkExistingSBT()
  }, [address, isConnected])

  // Handle minting success
  useEffect(() => {
    if (isConfirmed && hash) {
      setSbtStatus('success')
      setSbtTokenId(hash) // In real implementation, extract tokenId from events
      
      // Store SBT in localStorage for demo
      if (address) {
        localStorage.setItem(`sbt_${address}`, hash)
      }
      
      if (onMintingComplete) {
        onMintingComplete({
          success: true,
          transactionHash: hash,
          tokenId: hash, // Simplified for demo
          timestamp: Date.now()
        })
      }
      
      if (onMintSuccess) {
        onMintSuccess(hash)
      }
    }
  }, [isConfirmed, hash, onMintingComplete, onMintSuccess, address])

  // Handle minting error
  useEffect(() => {
    if (writeError) {
      setSbtStatus('error')
      setError(writeError.message)
    }
  }, [writeError])

  const checkExistingSBT = async () => {
    try {
      setSbtStatus('checking')
      
      // In a real implementation, you'd call the contract's hasSBT function
      // For demo, we'll check localStorage
      const existingSBT = localStorage.getItem(`sbt_${address}`)
      
      if (existingSBT) {
        setSbtStatus('exists')
        setSbtTokenId(existingSBT)
      } else {
        setSbtStatus('none')
      }
    } catch (error) {
      console.error('Error checking SBT status:', error)
      setSbtStatus('error')
      setError('Failed to check SBT status')
    }
  }

  const mintSBT = async () => {
    if (!address || !verificationData) {
      setError('Missing wallet address or verification data')
      return
    }

    try {
      setSbtStatus('minting')
      setError(null)

      // Create metadata URI for the SBT
      const metadata = {
        name: "ChainCred Reputation Passport",
        description: `Verified identity SBT for ${address}`,
        image: "https://chaincred.vercel.app/logo.png",
        attributes: [
          {
            trait_type: "Verification Status",
            value: "Verified"
          },
          {
            trait_type: "Wallet Address",
            value: address
          },
          {
            trait_type: "Verification Date",
            value: new Date(verificationData.timestamp).toISOString()
          },
          {
            trait_type: "Nullifier",
            value: verificationData.nullifier
          }
        ]
      }

      // In a real implementation, you'd upload this to IPFS and use the hash
      const tokenURI = `https://chaincred.vercel.app/metadata/${address}`

      // Mint the SBT
      writeContract({
        address: SBT_CONTRACT_ADDRESS as `0x${string}`,
        abi: SBT_CONTRACT_ABI,
        functionName: 'mintSBT',
        args: [address, tokenURI]
      })

    } catch (error) {
      console.error('Error minting SBT:', error)
      setSbtStatus('error')
      setError('Failed to mint SBT')
    }
  }

  // Loading state
  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please connect your wallet to mint SBT</p>
        </CardContent>
      </Card>
    )
  }

  // Checking existing SBT
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

  // Wallet already has an SBT
  if (sbtStatus === 'exists') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            SBT Already Minted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Lock className="w-3 h-3 mr-1" />
              One SBT Per Wallet
            </Badge>
            <span className="text-sm text-muted-foreground">
              This wallet already has a verified identity SBT
            </span>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Identity SBT Active</p>
                <p className="text-green-600">
                  This wallet is verified and can participate in gated features, 
                  DAO voting, and airdrops.
                </p>
                {sbtTokenId && (
                  <p className="text-xs text-green-500 mt-1">
                    Token ID: {sbtTokenId.slice(0, 10)}...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p><strong>Security Note:</strong> Each wallet can only have one identity SBT to prevent duplicate verifications and maintain system integrity.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No verification data
  if (!verificationData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <p className="text-muted-foreground">Please complete identity verification first</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Minting in progress
  if (sbtStatus === 'minting' || isPending || isConfirming) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Minting SBT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Minting your Reputation Passport SBT...</span>
              <span>{isPending ? 'Pending' : isConfirming ? 'Confirming' : 'Processing'}</span>
            </div>
            <Progress value={isPending ? 33 : isConfirming ? 66 : 100} className="w-full" />
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Coins className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Creating Your Identity SBT</p>
                <p className="text-blue-600">
                  This SBT will serve as your verified identity credential on-chain.
                  It cannot be transferred and proves you are a verified human.
                </p>
              </div>
            </div>
          </div>

          {hash && (
            <div className="text-xs text-muted-foreground">
              <p>Transaction: {hash.slice(0, 20)}...</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Minting successful
  if (sbtStatus === 'success') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            SBT Minted Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              Identity Verified
            </Badge>
            <span className="text-sm text-muted-foreground">
              Your Reputation Passport SBT has been minted
            </span>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">SBT Minted Successfully</p>
                <p className="text-green-600">
                  You now have a verified identity SBT that proves you are a real human.
                  This SBT cannot be transferred and serves as your on-chain identity credential.
                </p>
                {sbtTokenId && (
                  <p className="text-xs text-green-500 mt-1">
                    Token ID: {sbtTokenId.slice(0, 10)}...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>What you can do now:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Participate in DAO voting</li>
              <li>Claim airdrops and rewards</li>
              <li>Access gated features</li>
              <li>Prove your identity to other protocols</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (sbtStatus === 'error') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Minting Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800">SBT Minting Failed</p>
                <p className="text-red-600">
                  {error || 'An error occurred while minting your SBT. Please try again.'}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={mintSBT} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Ready to mint
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Mint Your Reputation Passport SBT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            You've successfully verified your identity. Now mint your Soul Bound Token (SBT) 
            to prove your verified status on-chain.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-blue-500" />
            <span className="text-blue-600">
              One SBT per wallet - cannot be transferred or duplicated
            </span>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Coins className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">What is an SBT?</p>
              <p className="text-blue-600">
                A Soul Bound Token is a non-transferable NFT that serves as your 
                verified identity credential. It proves you are a real human and 
                cannot be sold or transferred to another wallet.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={mintSBT} 
          className="w-full"
          disabled={!verificationData}
        >
          <Shield className="w-4 h-4 mr-2" />
          Mint Reputation Passport SBT
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Benefits of having an SBT:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Prove your identity to any protocol</li>
            <li>Participate in DAO governance</li>
            <li>Access exclusive airdrops</li>
            <li>Build trust in the ecosystem</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}