/* Complete Verification Flow with SBT Minting */
"use client"

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  QrCode, 
  Smartphone,
  Lock,
  Trophy,
  Loader2,
  FileText
} from "lucide-react"
import { countries, SelfQRcodeWrapper, SelfAppBuilder, getUniversalLink } from '@selfxyz/qrcode'
import { SELF_CONFIG, getCallbackUrl } from '@/lib/self-protocol'
import { RealSBTMinter } from './real-sbt-minter'
import { getContractAddress } from '@/lib/contract-addresses'

interface VerificationStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  current: boolean
  enabled: boolean
}

// Using real on-chain minter component; no mock ABI here

export function VerificationFlow() {
  const { address, isConnected, chain } = useAccount()
  const [selfApp, setSelfApp] = useState<any | null>(null)
  const [universalLink, setUniversalLink] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [sbtMinted, setSbtMinted] = useState(false)

  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'connect_wallet',
      title: 'Connect Wallet',
      description: 'Connect your Ethereum wallet to start verification',
      icon: <Shield className="w-5 h-5" />,
      completed: false,
      current: true,
      enabled: true
    },
    {
      id: 'initialize_self',
      title: 'Initialize Self Protocol',
      description: 'Prepare the Self Protocol app for verification',
      icon: <Smartphone className="w-5 h-5" />,
      completed: false,
      current: false,
      enabled: false
    },
    {
      id: 'scan_qr',
      title: 'Scan QR Code',
      description: 'Scan with Self Protocol mobile app to verify identity',
      icon: <QrCode className="w-5 h-5" />,
      completed: false,
      current: false,
      enabled: false
    },
    {
      id: 'proof_verification',
      title: 'Proof Verification',
      description: 'Verify zero-knowledge proof on-chain',
      icon: <CheckCircle className="w-5 h-5" />,
      completed: false,
      current: false,
      enabled: false
    },
    {
      id: 'mint_sbt',
      title: 'Mint SBT',
      description: 'Mint your Reputation Passport SBT',
      icon: <Trophy className="w-5 h-5" />,
      completed: false,
      current: false,
      enabled: false
    }
  ])

  // Initialize Self Protocol app when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      updateStep('connect_wallet', true)

      try {
        // If this wallet was already verified in this browser, skip verification steps and enable mint
        const stored = localStorage.getItem(`self_verification_${address}`)
        const alreadyMinted = localStorage.getItem(`sbt_minted_${address}`) === 'true'
        const globalVerified = localStorage.getItem('self_verified_global')

        if (stored) {
          // parse stored verification and mark steps as completed
          try {
            const verificationData = JSON.parse(stored)
            if (verificationData?.verified) {
              setVerificationResult(verificationData)
              // mark connect and verify steps completed
              updateStep('connect_wallet', true)
              updateStep('initialize_self', true)
              updateStep('scan_qr', true)
              updateStep('proof_verification', true)
              // If user hasn't minted, enable mint step
              if (!alreadyMinted) {
                updateStep('mint_sbt', false, true)
              } else {
                // user already minted — mark mint completed and do not show mint UI
                updateStep('mint_sbt', true)
                setSbtMinted(true)
              }
              // skip initializing the Self app
              return
            }
          } catch (e) {
            console.warn('Could not parse per-wallet verification', e)
          }
        }

        // Prevent verification if a different wallet has already been verified in this browser
        if (globalVerified && globalVerified !== address) {
          setError(`This browser already has a verified wallet: ${globalVerified}. Connect that wallet to proceed or reset verification from the verified wallet.`)
          // don't initialize the Self app for another wallet
          return
        }

      } catch (e) {
        console.warn('Could not read verification markers', e)
      }

      // No existing verification for this wallet — initialize the Self app
      initializeSelfApp()
    }
  }, [isConnected, address])

  const initializeSelfApp = () => {
    if (!address) return

    try {
      console.log('🚀 Initializing Self Protocol app...')
      
      const app = new SelfAppBuilder({
        version: SELF_CONFIG.VERSION,
        appName: SELF_CONFIG.APP_NAME,
        scope: SELF_CONFIG.SCOPE,
        endpoint: SELF_CONFIG.CONTRACT_ADDRESS,
        logoBase64: SELF_CONFIG.LOGO_URL,
        userId: address,
        endpointType: SELF_CONFIG.ENDPOINT_TYPE,
        userIdType: SELF_CONFIG.USER_ID_TYPE,
        userDefinedData: `ChainCred Reputation Passport for ${address}`,
        deeplinkCallback: getCallbackUrl(),
        disclosures: {
          minimumAge: SELF_CONFIG.DISCLOSURES.minimumAge,
          excludedCountries: SELF_CONFIG.DISCLOSURES.excludedCountries as any,
          nationality: SELF_CONFIG.DISCLOSURES.nationality,
          gender: SELF_CONFIG.DISCLOSURES.gender,
          ofac: SELF_CONFIG.DISCLOSURES.ofac
        },
      }).build()

      setSelfApp(app)
      
      const universalLink = getUniversalLink(app)
      setUniversalLink(universalLink)
      
      console.log('✅ Self Protocol app initialized successfully')
      updateStep('initialize_self', true)
      updateStep('scan_qr', false, true)

    } catch (error) {
      console.error('❌ Error initializing Self Protocol app:', error)
      setError(`Failed to initialize Self Protocol app: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const updateStep = (stepId: string, completed: boolean, isCurrent: boolean = false) => {
    setVerificationSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return { ...step, completed, current: isCurrent }
      }
      if (isCurrent) {
        return { ...step, current: false }
      }
      return step
    }))
  }

  const handleSuccessfulVerification = (data: any = {}) => {
    console.log('🎉 Self Protocol verification successful!', data)
    setVerificationResult(data)
    setIsVerifying(false)
    setError('')
    updateStep('scan_qr', true)
    updateStep('proof_verification', false, true)

    // Simulate on-chain verification
    setTimeout(() => {
      console.log('Simulating on-chain proof verification...')
      updateStep('proof_verification', true)
      updateStep('mint_sbt', false, true)
    }, 2000)
    // Persist global marker so other wallets in this browser cannot re-verify
    try {
      if (address) {
        localStorage.setItem('self_verified_global', address)
        // Also persist a per-wallet verification record so mint UI can detect it
        const verificationData = {
          walletAddress: address,
          verified: true,
          timestamp: Date.now(),
          proof: data || null,
        }
        localStorage.setItem(`self_verification_${address}`, JSON.stringify(verificationData))
        // Notify same-window listeners that verification state changed
        try {
          window.dispatchEvent(new Event('selfVerificationChanged'))
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Could not set global verification marker', e)
    }
  }

  const handleVerificationError = (data: { error_code?: string; reason?: string } = {}) => {
    console.error('❌ Self Protocol verification failed:', data)
    setIsVerifying(false)
    setError(`Verification failed: ${data.reason || data.error_code || 'Unknown error'}`)
  }

  // Minting handled by RealSBTMinter

  const openSelfApp = () => {
    if (universalLink) {
      window.open(universalLink, "_blank")
    }
  }

  const handleSBTMintingComplete = (result: any) => {
    console.log('SBT minting completed:', result)
    if (result.success) {
      setSbtMinted(true)
      updateStep('mint_sbt', true)
    }
  }

  const resetVerificationFlow = () => {
    setSelfApp(null)
    setUniversalLink("")
    setIsVerifying(false)
    setVerificationResult(null)
    setError('')
    setVerificationSteps(prev => prev.map(step => ({
      ...step,
      completed: false,
      current: step.id === 'connect_wallet'
    })))
    // Clear persisted verification marker for this wallet only if it set the global marker
    try {
      if (address) {
        localStorage.removeItem(`self_verification_${address}`)
        const global = localStorage.getItem('self_verified_global')
        if (global === address) {
          localStorage.removeItem('self_verified_global')
        }
        try {
          window.dispatchEvent(new Event('selfVerificationChanged'))
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Could not clear verification marker from localStorage', e)
    }
  }

  const currentStepIndex = verificationSteps.findIndex(step => step.current);
  const progressValue = ((currentStepIndex + (verificationSteps[currentStepIndex]?.completed ? 1 : 0)) / verificationSteps.length) * 100;

  const isVerificationComplete = verificationSteps.find(step => step.id === 'proof_verification')?.completed
  const isSBTEnabled = isVerificationComplete && !verificationSteps.find(step => step.id === 'mint_sbt')?.completed

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verification Progress
          </CardTitle>
          <CardDescription>
            Complete each step to mint your Reputation Passport SBT
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressValue} className="w-full" />
          <div className="grid grid-cols-1 gap-3">
            {verificationSteps.map(step => (
              <div key={step.id} className={`flex items-center gap-3 p-3 rounded-md ${
                step.completed ? 'bg-green-50' :
                step.current ? 'bg-blue-50' :
                'bg-gray-50'
              }`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  step.completed ? 'bg-green-100 text-green-600' :
                  step.current ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : step.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {step.completed && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Completed
                  </Badge>
                )}
                {step.current && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Current
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      {selfApp && verificationSteps.find(step => step.id === 'scan_qr')?.current && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Scan QR Code
            </CardTitle>
            <CardDescription>
              Open the Self Protocol mobile app and scan the QR code below
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center p-4 border rounded-lg bg-white">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={handleSuccessfulVerification}
                onError={handleVerificationError}
                size={250}
                darkMode={false}
                type="websocket"
              />
            </div>
            
            {universalLink && (
              <Button 
                onClick={openSelfApp}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Open Self App
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Real SBT Minting Section */}
      {isSBTEnabled && (
        <RealSBTMinter
          isVerificationComplete={!!verificationResult}
          verificationData={verificationResult}
          contractAddress={getContractAddress('ReputationPassport', chain?.id)}
          onMintSuccess={(txHash) => {
            console.log('SBT minted successfully:', txHash)
            setSbtMinted(true)
            updateStep('mint_sbt', true)
            handleSBTMintingComplete({ success: true, txHash })
            try {
              if (address) {
                localStorage.setItem(`sbt_minted_${address}`, 'true')
                try { window.dispatchEvent(new Event('selfVerificationChanged')) } catch (e) { /* ignore */ }
              }
            } catch (e) {
              console.warn('Could not persist SBT minted flag', e)
            }
          }}
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      {/* {verificationResult && (
        <div className="text-center">
          <Button onClick={resetVerificationFlow} variant="outline">
            Reset Verification Flow
          </Button>
        </div>
      )} */}
    </div>
  )
}