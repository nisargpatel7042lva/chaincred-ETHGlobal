/* Complete Self Protocol QR Code Authentication Component */
"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { selfProtocolCompleteService, type SelfVerificationResponse, type SelfVerificationResult } from "@/lib/self-protocol-complete"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Shield,
  Clock,
  AlertCircle
} from "lucide-react"

interface SelfProtocolCompleteProps {
  onVerificationComplete?: (result: SelfVerificationResult) => void
  onError?: (error: string) => void
}

export function SelfProtocolComplete({ onVerificationComplete, onError }: SelfProtocolCompleteProps) {
  const { address } = useAccount()
  const [verificationResponse, setVerificationResponse] = useState<SelfVerificationResponse | null>(null)
  const [verificationResult, setVerificationResult] = useState<SelfVerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)

  // Start verification process
  const startVerification = async () => {
    if (!address) {
      setError("Please connect your wallet first")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await selfProtocolCompleteService.createVerificationRequest(address)
      setVerificationResponse(response)
      setTimeLeft(Math.floor((response.expiresAt - Date.now()) / 1000))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start verification"
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Check verification status
  const checkVerificationStatus = async () => {
    if (!verificationResponse) return

    setIsChecking(true)
    try {
      const result = await selfProtocolCompleteService.checkVerificationStatus(verificationResponse.verificationId)
      
      if (result) {
        setVerificationResult(result)
        onVerificationComplete?.(result)
      }
    } catch (err) {
      console.error("Error checking verification status:", err)
    } finally {
      setIsChecking(false)
    }
  }

  // Simulate mobile app verification (for demo)
  const simulateMobileVerification = async () => {
    if (!verificationResponse) return

    setIsChecking(true)
    try {
      const success = await selfProtocolCompleteService.simulateMobileVerification(verificationResponse.verificationId)
      
      if (success) {
        // Wait a moment then check status
        setTimeout(() => {
          checkVerificationStatus()
        }, 2000)
      }
    } catch (err) {
      console.error("Error simulating mobile verification:", err)
    }
  }

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  // Auto-check verification status every 3 seconds
  useEffect(() => {
    if (verificationResponse && !verificationResult && timeLeft > 0) {
      const interval = setInterval(checkVerificationStatus, 3000)
      return () => clearInterval(interval)
    }
  }, [verificationResponse, verificationResult, timeLeft])

  // Reset function
  const resetVerification = () => {
    setVerificationResponse(null)
    setVerificationResult(null)
    setError(null)
    setTimeLeft(0)
  }

  // Show verification result
  if (verificationResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Identity Verified Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              ZK Proof Valid
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet:</span>
              <span className="font-mono">
                {verificationResult.walletAddress.slice(0, 6)}...
                {verificationResult.walletAddress.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Country:</span>
              <span>{verificationResult.identityData.country}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age Verified:</span>
              <span>{verificationResult.identityData.age}+ years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Human Verified:</span>
              <span>{verificationResult.identityData.isHuman ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Not Sanctioned:</span>
              <span>{verificationResult.identityData.isNotSanctioned ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified At:</span>
              <span>{new Date(verificationResult.proof.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Identity Verification Complete</p>
                <p className="text-green-600">
                  Your identity has been verified using zero-knowledge proofs. Your personal data remains private while proving you meet the requirements.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={resetVerification} variant="outline" className="w-full">
            Verify Another Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show QR code and instructions
  if (verificationResponse) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scan QR Code with Self App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Time Remaining</span>
            </div>
            <Badge variant={timeLeft > 60 ? "default" : "destructive"}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Verification Progress</span>
              <span>{isChecking ? "Checking..." : "Waiting for scan"}</span>
            </div>
            <Progress value={isChecking ? 50 : 25} className="h-2" />
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
              <img 
                src={verificationResponse.qrCodeData} 
                alt="Self Protocol QR Code"
                className="w-64 h-64"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">How to Verify:</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Open the Self Protocol app on your mobile device</li>
                    <li>Tap "Scan QR Code" or use the camera</li>
                    <li>Point your camera at the QR code above</li>
                    <li>Follow the prompts in the Self app</li>
                    <li>Complete the identity verification process</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Demo Button */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Demo Mode</p>
                  <p className="text-xs text-yellow-600">Simulate mobile app verification</p>
                </div>
                <Button 
                  onClick={simulateMobileVerification}
                  disabled={isChecking}
                  size="sm"
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    "Simulate Scan"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-blue-600">Checking verification status...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-600">Waiting for QR code scan...</span>
                </>
              )}
            </div>
            <Button onClick={resetVerification} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Verification Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <Button onClick={startVerification} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Initial state
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Self Protocol Identity Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Shield className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <h3 className="font-medium text-blue-800">Privacy-First Identity Verification</h3>
            <p className="text-sm text-blue-600">
              Verify your identity using zero-knowledge proofs without revealing personal data
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Proves you're human without revealing identity</p>
            <p>• Verifies age and country requirements</p>
            <p>• Uses Self Protocol mobile app</p>
            <p>• Generates cryptographic proof</p>
          </div>
        </div>

        {!address ? (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">Please connect your wallet to start verification</p>
            </div>
          </div>
        ) : (
          <Button 
            onClick={startVerification}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Verification Request...
              </>
            ) : (
              "Start Identity Verification"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
