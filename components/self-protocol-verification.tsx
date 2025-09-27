/* Fresh Self Protocol Verification Component - Following Official SDK */
"use client"

import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  QrCode, 
  Smartphone,
  Link as LinkIcon,
  Clock
} from "lucide-react"
import { countries, SelfQRcodeWrapper, SelfAppBuilder, getUniversalLink } from '@selfxyz/qrcode'
import { SELF_CONFIG, getCallbackUrl } from '@/lib/self-protocol'

export function SelfProtocolVerification() {
  const { address, isConnected } = useAccount()
  const [selfApp, setSelfApp] = useState<any | null>(null)
  const [universalLink, setUniversalLink] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  // Initialize Self Protocol app when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      initializeSelfApp()
    }
  }, [isConnected, address])

  const initializeSelfApp = () => {
    if (!address) return

    try {
      console.log('🚀 Initializing Self Protocol app...')

      // Create SelfApp using SelfAppBuilder - EXACTLY as per documentation
      const app = new SelfAppBuilder({
        version: SELF_CONFIG.VERSION,
        appName: SELF_CONFIG.APP_NAME,
        scope: SELF_CONFIG.SCOPE,
        endpoint: SELF_CONFIG.CONTRACT_ADDRESS, // Contract address for onchain verification
        logoBase64: SELF_CONFIG.LOGO_URL,
        userId: address, // Wallet address as userId
        endpointType: SELF_CONFIG.ENDPOINT_TYPE, // staging_celo for testing
        userIdType: SELF_CONFIG.USER_ID_TYPE, // hex for EVM address
        userDefinedData: `ChainCred Reputation Passport for ${address}`,
        deeplinkCallback: getCallbackUrl(),
        disclosures: SELF_CONFIG.DISCLOSURES
      }).build()

      setSelfApp(app)
      
      // Generate universal link for mobile app
      const universalLink = getUniversalLink(app)
      setUniversalLink(universalLink)
      
      console.log('✅ Self Protocol app initialized successfully')
      console.log('🔗 Universal link:', universalLink)

    } catch (error) {
      console.error('❌ Error initializing Self Protocol app:', error)
      setError(`Failed to initialize Self Protocol app: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleSuccessfulVerification = (result: any) => {
    console.log('🎉 Self Protocol verification successful!', result)
    
    setVerificationResult(result)
    setIsVerifying(false)
    
    // Here you would typically:
    // 1. Store the verification result
    // 2. Update user status
    // 3. Trigger reputation calculation
    // 4. Mint SBT
  }

  const handleVerificationError = (error: any) => {
    console.error('❌ Self Protocol verification failed:', error)
    setError(`Verification failed: ${error.reason || 'Unknown error'}`)
    setIsVerifying(false)
  }

  const openSelfApp = () => {
    if (!universalLink) return
    window.open(universalLink, "_blank")
  }

  const resetVerification = () => {
    setVerificationResult(null)
    setError('')
    setIsVerifying(false)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please connect your wallet to start verification</p>
        </CardContent>
      </Card>
    )
  }

  if (!selfApp) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            <p className="text-muted-foreground">Initializing Self Protocol...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Self Protocol QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Self Protocol Identity Verification
          </CardTitle>
          <CardDescription>
            Scan this QR code with the Self Protocol mobile app to verify your identity
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccessfulVerification}
              onError={handleVerificationError}
              size={300}
              darkMode={false}
              type="websocket"
            />
          </div>
          
          {/* Mobile Deep Link Button */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Or open directly in Self Protocol app:
            </p>
            <Button 
              onClick={openSelfApp}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Open Self App
            </Button>
          </div>

          {/* App Download Links */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>📱 Download Self Protocol app:</p>
            <div className="flex justify-center gap-4">
              <a 
                href="https://play.google.com/store/apps/details?id=com.proofofpassportapp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Play
              </a>
              <a 
                href="https://apps.apple.com/app/self-protocol/id1234567890" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                App Store
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Verification Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {verificationResult.userId || address}</p>
              <p><strong>Verified:</strong> {verificationResult.verified ? 'Yes' : 'No'}</p>
              <p><strong>Timestamp:</strong> {new Date(verificationResult.timestamp || Date.now()).toLocaleString()}</p>
              {verificationResult.disclosures && (
                <div>
                  <p><strong>Disclosures:</strong></p>
                  <ul className="ml-4 space-y-1">
                    {verificationResult.disclosures.nationality && (
                      <li>• Nationality: {verificationResult.disclosures.nationality}</li>
                    )}
                    {verificationResult.disclosures.minimumAge && (
                      <li>• Age: {verificationResult.disclosures.minimumAge}+ verified</li>
                    )}
                    {verificationResult.disclosures.ofac && (
                      <li>• OFAC Check: Passed</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        {verificationResult && (
          <Button onClick={resetVerification} variant="outline">
            Reset Verification
          </Button>
        )}
      </div>

      {/* Configuration Info */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm">Self Protocol Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>App Name:</strong> {SELF_CONFIG.APP_NAME}</p>
            <p><strong>Scope:</strong> {SELF_CONFIG.SCOPE}</p>
            <p><strong>Endpoint Type:</strong> {SELF_CONFIG.ENDPOINT_TYPE}</p>
            <p><strong>User ID Type:</strong> {SELF_CONFIG.USER_ID_TYPE}</p>
            <p><strong>Contract Address:</strong> {SELF_CONFIG.CONTRACT_ADDRESS}</p>
            <p><strong>Minimum Age:</strong> {SELF_CONFIG.DISCLOSURES.minimumAge}</p>
            <p><strong>OFAC Check:</strong> {SELF_CONFIG.DISCLOSURES.ofac ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Excluded Countries:</strong> {SELF_CONFIG.DISCLOSURES.excludedCountries.join(', ')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}