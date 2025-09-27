/* Real SBT Minter Component - Uses Deployed Contracts */
"use client"

import React, { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Trophy, Loader2, CheckCircle, AlertCircle, ExternalLink, Copy } from "lucide-react"

// Real SBT Contract ABI - ReputationPassport
const REPUTATION_PASSPORT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "explanation",
        "type": "string"
      }
    ],
    "name": "mintReputationPassport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "hasReputationPassport",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "isEligibleForSBT",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "getScore",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

interface RealSBTMinterProps {
  isVerificationComplete: boolean
  verificationData?: any
  contractAddress?: string
  onMintSuccess?: (txHash: string) => void
}

export function RealSBTMinter({ 
  isVerificationComplete, 
  verificationData, 
  contractAddress = '0x1234567890123456789012345678901234567890', // Default mock address
  onMintSuccess 
}: RealSBTMinterProps) {
  const { address, isConnected, chain } = useAccount()
  const [explanation, setExplanation] = useState('')
  const [isMinting, setIsMinting] = useState(false)

  // Check if user already has SBT
  const { data: hasSBT, refetch: refetchHasSBT } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: REPUTATION_PASSPORT_ABI,
    functionName: 'hasReputationPassport',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress
    }
  })

  // Check if user is eligible for SBT
  const { data: isEligible, refetch: refetchEligibility } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: REPUTATION_PASSPORT_ABI,
    functionName: 'isEligibleForSBT',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress
    }
  })

  // Get user's score
  const { data: userScore } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: REPUTATION_PASSPORT_ABI,
    functionName: 'getScore',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress && !!hasSBT
    }
  })

  // Get total supply
  const { data: totalSupply } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: REPUTATION_PASSPORT_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!contractAddress
    }
  })

  // SBT minting
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Refetch data when address changes
  useEffect(() => {
    if (address) {
      refetchHasSBT()
      refetchEligibility()
    }
  }, [address, refetchHasSBT, refetchEligibility])

  // Call onMintSuccess when minting is confirmed
  useEffect(() => {
    if (isConfirmed && hash && onMintSuccess) {
      onMintSuccess(hash)
    }
  }, [isConfirmed, hash, onMintSuccess])

  const handleMintSBT = async () => {
    if (!address || !isVerificationComplete || !explanation.trim()) return
    
    setIsMinting(true)
    try {
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: REPUTATION_PASSPORT_ABI,
        functionName: 'mintReputationPassport',
        args: [explanation.trim()],
      })
    } catch (err) {
      console.error('SBT minting failed:', err)
    } finally {
      setIsMinting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getEtherscanUrl = () => {
    if (!chain) return ''
    const baseUrls = {
      1: 'https://etherscan.io',
      11155111: 'https://sepolia.etherscan.io',
      137: 'https://polygonscan.com',
      80001: 'https://mumbai.polygonscan.com',
      56: 'https://bscscan.com',
      97: 'https://testnet.bscscan.com',
      42220: 'https://celoscan.io',
      44787: 'https://alfajores.celoscan.io'
    }
    return baseUrls[chain.id as keyof typeof baseUrls] || 'https://etherscan.io'
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please connect your wallet first</p>
        </CardContent>
      </Card>
    )
  }

  // User already has SBT
  if (hasSBT) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" />
            Reputation Passport SBT Already Minted
          </CardTitle>
          <CardDescription>
            You already have a Reputation Passport SBT in your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">SBT Already Minted!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Your Reputation Passport SBT is already in your wallet.
            </p>
            {userScore && (
              <p className="text-sm text-green-600 mt-1">
                Your reputation score: <strong>{userScore.toString()}</strong>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Contract Address:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(contractAddress)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network:</span>
              <Badge variant="secondary">
                {chain?.name || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total SBTs Minted:</span>
              <span className="text-sm text-muted-foreground">
                {totalSupply?.toString() || '0'}
              </span>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <a 
              href={`${getEtherscanUrl()}/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Contract on Etherscan
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Check eligibility
  const canMint = isVerificationComplete && isEligible && !hasSBT

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Mint Reputation Passport SBT
        </CardTitle>
        <CardDescription>
          {canMint 
            ? "Your identity has been verified! Mint your Reputation Passport SBT."
            : !isVerificationComplete 
              ? "Complete identity verification to enable SBT minting."
              : !isEligible
                ? "Your wallet doesn't meet the minimum requirements for SBT minting."
                : "Ready to mint your SBT."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Verification Status:</span>
            <Badge variant={isVerificationComplete ? "default" : "secondary"}>
              {isVerificationComplete ? "Verified" : "Not Verified"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Eligibility:</span>
            <Badge variant={isEligible ? "default" : "destructive"}>
              {isEligible ? "Eligible" : "Not Eligible"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">SBT Status:</span>
            <Badge variant={hasSBT ? "default" : "secondary"}>
              {hasSBT ? "Already Minted" : "Not Minted"}
            </Badge>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Wallet:</span>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network:</span>
            <Badge variant="secondary">
              {chain?.name || 'Unknown'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Contract:</span>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(contractAddress)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Explanation Input */}
        {canMint && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Explanation (Required):</label>
            <Input
              placeholder="Explain why you deserve this reputation passport..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Provide a brief explanation of your on-chain activity and reputation.
            </p>
          </div>
        )}

        {/* Mint Button */}
        <Button 
          onClick={handleMintSBT}
          disabled={!canMint || !explanation.trim() || isPending || isConfirming || isMinting}
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
              {canMint ? 'Mint SBT' : 'Requirements Not Met'}
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
              <div className="mt-2 space-y-2">
                <p className="text-xs text-green-600">
                  Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                </p>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <a 
                    href={`${getEtherscanUrl()}/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View Transaction on Etherscan
                  </a>
                </Button>
              </div>
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

        {/* Contract Info */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Real On-Chain SBT:</strong> This will mint a real Soulbound Token to your wallet that can be used for voting, airdrops, and other Web3 activities. The transaction will be visible on Etherscan.
          </p>
        </div>

        {/* Contract Link */}
        <Button
          asChild
          variant="outline"
          className="w-full"
        >
          <a 
            href={`${getEtherscanUrl()}/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Contract on Etherscan
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
