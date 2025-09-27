/* Verification Context - State management without localStorage */
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAccount } from 'wagmi'

export interface VerificationState {
  isVerified: boolean
  verificationData: VerificationData | null
  currentStep: number
  isVerifying: boolean
}

export interface VerificationData {
  walletAddress: string
  identityVerified: boolean
  zkProofVerified: boolean
  linked: boolean
  timestamp: number
  nullifier: string
  reputationBoost: number
  identityData?: {
    country: string
    age: number
    isHuman: boolean
    isNotSanctioned: boolean
  }
}

interface VerificationContextType {
  verificationState: VerificationState
  startVerification: () => void
  completeStep: (step: number) => void
  setVerificationData: (data: VerificationData) => void
  resetVerification: () => void
  isWalletVerified: (address: string) => boolean
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined)

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount()
  
  const [verificationState, setVerificationState] = useState<VerificationState>({
    isVerified: false,
    verificationData: null,
    currentStep: 0,
    isVerifying: false
  })

  // Reset verification when wallet changes
  useEffect(() => {
    setVerificationState({
      isVerified: false,
      verificationData: null,
      currentStep: 0,
      isVerifying: false
    })
  }, [address])

  const startVerification = () => {
    setVerificationState(prev => ({
      ...prev,
      isVerifying: true,
      currentStep: 1
    }))
  }

  const completeStep = (step: number) => {
    setVerificationState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep, step + 1)
    }))
  }

  const setVerificationData = (data: VerificationData) => {
    setVerificationState(prev => ({
      ...prev,
      isVerified: true,
      verificationData: data,
      currentStep: 4,
      isVerifying: false
    }))
  }

  const resetVerification = () => {
    setVerificationState({
      isVerified: false,
      verificationData: null,
      currentStep: 0,
      isVerifying: false
    })
  }

  const isWalletVerified = (walletAddress: string) => {
    return verificationState.isVerified && 
           verificationState.verificationData?.walletAddress === walletAddress
  }

  const value: VerificationContextType = {
    verificationState,
    startVerification,
    completeStep,
    setVerificationData,
    resetVerification,
    isWalletVerified
  }

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  )
}

export function useVerification() {
  const context = useContext(VerificationContext)
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider')
  }
  return context
}
