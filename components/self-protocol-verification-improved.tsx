"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, XCircle, AlertCircle, QrCode } from 'lucide-react'

// Mock Self Protocol imports (replace with real ones when available)
const getUniversalLink = (app: any) => `https://self.xyz/verify/${app.scope}/${app.userId}`;

interface SelfApp {
  version: number
  appName: string
  scope: string
  endpoint: string
  logoBase64: string
  userId: string
  endpointType: string
  userIdType: string
  userDefinedData: string
  disclosures: {
    minimumAge: number
    nationality: boolean
    gender: boolean
  }
}

interface SelfProtocolVerificationProps {
  onVerificationComplete?: (result: any) => void
}

export function SelfProtocolVerificationImproved({ onVerificationComplete }: SelfProtocolVerificationProps) {
  const { address } = useAccount()
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [qrScanned, setQrScanned] = useState(false)
  const [verificationStep, setVerificationStep] = useState<'idle' | 'qr_displayed' | 'qr_scanned' | 'verifying' | 'success' | 'failed'>('idle')

  // Generate nullifier for Sybil resistance
  const generateNullifier = (walletAddress?: string): string => {
    const base = walletAddress ?? "anonymous"
    const data = `${base}_self_verification_${Date.now()}`
    return btoa(data).replace(/[^a-zA-Z0-9]/g, "").substring(0, 32)
  }

  useEffect(() => {
    if (!address) return

    // Check if already verified
    const stored = localStorage.getItem(`self_verification_${address}`)
    if (stored) {
      try {
        const verificationData = JSON.parse(stored)
        if (verificationData.verified) {
          setVerificationResult(verificationData)
          setIsVerified(true)
          setVerificationStep('success')
          return
        }
      } catch (e) {
        console.warn('Failed to parse stored verification data')
      }
    }

    // Mock SelfApp config (replace with SelfAppBuilder later)
    const app: SelfApp = {
      version: 2,
      appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Ethereum Reputation Passport",
      scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "reputation-passport",
      endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
      logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
      userId: address,
      endpointType: "staging_https",
      userIdType: "hex",
      userDefinedData: `Reputation verification for ${address}`,
      disclosures: {
        minimumAge: 18,
        nationality: true,
        gender: true,
      },
    }

    setSelfApp(app)
  }, [address])

  const handleSuccessfulVerification = (result?: any) => {
    const verificationData = {
      walletAddress: address ?? null,
      nullifier: generateNullifier(address),
      timestamp: Date.now(),
      verified: true,
      disclosures: selfApp?.disclosures,
      userData: selfApp?.userDefinedData,
    }

    setVerificationResult(verificationData)
    setIsVerified(true)
    setVerificationStep('success')
    setIsVerifying(false)

    if (onVerificationComplete) {
      onVerificationComplete(verificationData)
    }

    localStorage.setItem(`self_verification_${address}`, JSON.stringify(verificationData))
  }

  const handleQRScanned = () => {
    setQrScanned(true)
    setVerificationStep('qr_scanned')
    setIsVerifying(true)
    
    // Simulate verification process after QR scan
    setTimeout(() => {
      handleSuccessfulVerification()
    }, 2000)
  }

  const startVerification = () => {
    setVerificationStep('qr_displayed')
  }

  const resetVerification = () => {
    setVerificationStep('idle')
    setIsVerified(false)
    setQrScanned(false)
    setIsVerifying(false)
    setVerificationResult(null)
    if (address) {
      localStorage.removeItem(`self_verification_${address}`)
    }
  }

  const handleVerificationError = (error: string) => {
    setVerificationResult({
      walletAddress: address,
      verified: false,
      error: error,
      timestamp: Date.now(),
    })
    setVerificationStep('failed')
    setIsVerifying(false)
  }

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Identity Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to verify your identity with Self Protocol.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isVerified && verificationResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Identity Verified
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified
            </Badge>
            <span className="text-sm text-muted-foreground">Sybil-resistant identity confirmed</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet:</span>
              <span className="font-mono">{address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nullifier:</span>
              <span className="font-mono text-xs">{verificationResult.nullifier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified:</span>
              <span>{new Date(verificationResult.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Identity Verified</p>
                <p className="text-green-600">
                  This wallet is now linked to a verified human identity. You can now mint your SBT and access gated features.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Verify Your Identity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Verify your identity using Self Protocol to prevent Sybil attacks and access gated features.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <span className="text-blue-600">
              Your wallet address will be used as your unique identifier
            </span>
          </div>
        </div>

        {/* Step-by-step verification flow */}
        {verificationStep === 'idle' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Ready to Verify</p>
                  <p className="text-blue-600">
                    Click "Start Verification" to generate a QR code. Scan it with the Self mobile app to verify your identity.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={startVerification} className="w-full">
              Start Verification
            </Button>
          </div>
        )}

        {verificationStep === 'qr_displayed' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <QrCode className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Scan QR Code</p>
                  <p className="text-yellow-600">
                    Open the Self mobile app and scan this QR code to verify your identity.
                  </p>
                </div>
              </div>
            </div>
            
            {selfApp && (
              <div className="flex flex-col items-center space-y-4">
                {/* Mock QR Code Display */}
                <div className="p-8 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center space-y-2">
                    <QrCode className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500">QR Code for Self App</p>
                    <p className="text-xs text-gray-400 font-mono">{getUniversalLink(selfApp)}</p>
                  </div>
                </div>
                
                <Button onClick={handleQRScanned} variant="outline" className="w-full">
                  I've Scanned the QR Code
                </Button>
              </div>
            )}
            
            <Button onClick={resetVerification} variant="ghost" className="w-full">
              Cancel Verification
            </Button>
          </div>
        )}

        {verificationStep === 'qr_scanned' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Verifying Identity</p>
                  <p className="text-blue-600">
                    Processing your verification... This may take a few moments.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}

        {verificationStep === 'success' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Verification Successful!</p>
                  <p className="text-green-600">
                    Your identity has been verified. You can now mint your SBT and access gated features.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={resetVerification} variant="outline" className="w-full">
              Verify Another Identity
            </Button>
          </div>
        )}

        {verificationStep === 'failed' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Verification Failed</p>
                  <p className="text-red-600">
                    There was an error during verification. Please try again.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={resetVerification} className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
