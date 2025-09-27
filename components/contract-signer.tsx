/* Simple Contract Signer Component */
"use client"

import React, { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, FileText } from "lucide-react"

// Mock contract address and ABI for demonstration
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "registerUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export function ContractSigner() {
  const { address, isConnected } = useAccount()
  const [isSigning, setIsSigning] = useState(false)
  
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSignContract = async () => {
    if (!address) return
    
    setIsSigning(true)
    try {
      // In a real implementation, this would call the actual contract
      // For demo purposes, we'll simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock contract call
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'registerUser',
        args: [address],
      })
    } catch (err) {
      console.error('Contract signing failed:', err)
    } finally {
      setIsSigning(false)
    }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Step 2: Sign Contract
        </CardTitle>
        <CardDescription>
          Sign the verification contract to proceed with identity verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Wallet:</span>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </code>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Contract:</span>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
            {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
          </code>
        </div>

        {!isConfirmed && (
          <Button 
            onClick={handleSignContract}
            disabled={isPending || isConfirming || isSigning}
            className="w-full"
          >
            {(isPending || isConfirming || isSigning) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Signing...'}
              </>
            ) : (
              'Sign Contract'
            )}
          </Button>
        )}

        {isConfirmed && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">Contract signed successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">Error: {error.message}</p>
          </div>
        )}

        {hash && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
