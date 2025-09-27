/* Verification Flow - No localStorage dependency */
"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { useVerification } from "@/contexts/verification-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  CheckCircle, 
  QrCode, 
  Link, 
  User, 
  Loader2,
  AlertCircle
} from "lucide-react"

const verificationSteps = [
  { id: 'connect_wallet', title: 'Connect Wallet', icon: User },
  { id: 'start_verification', title: 'Start Verification', icon: Shield },
  { id: 'scan_qr', title: 'Scan QR Code', icon: QrCode },
  { id: 'link_wallet', title: 'Link Wallet', icon: Link }
]

export function VerificationFlow() {
  const { address } = useAccount()
  const { verificationState, startVerification, completeStep, setVerificationData, resetVerification } = useVerification()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleStartVerification = async () => {
    if (!address) return
    
    startVerification()
    completeStep(0) // Complete wallet connection step
    
    // Simulate QR code generation
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    completeStep(1) // Complete verification start step
    setIsProcessing(false)
  }

  const handleScanQR = async () => {
    setIsProcessing(true)
    
    // Simulate QR code scanning and ZK proof verification
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    completeStep(2) // Complete QR scan step
    setIsProcessing(false)
  }

  const handleLinkWallet = async () => {
    if (!address) return
    
    setIsProcessing(true)
    
    // Simulate wallet linking
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create verification data
    const verificationData = {
      walletAddress: address,
      identityVerified: true,
      zkProofVerified: true,
      linked: true,
      timestamp: Date.now(),
      nullifier: `nullifier_${address}_${Date.now()}`,
      reputationBoost: 20,
      identityData: {
        country: 'US',
        age: 25,
        isHuman: true,
        isNotSanctioned: true
      }
    }
    
    setVerificationData(verificationData)
    setIsProcessing(false)
  }

  // Show verified state
  if (verificationState.isVerified && verificationState.verificationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Wallet Verified & Linked
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Sybil-Resistant
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet:</span>
              <span className="font-mono">
                {verificationState.verificationData.walletAddress.slice(0, 6)}...
                {verificationState.verificationData.walletAddress.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reputation Boost:</span>
              <span className="font-medium">+{verificationState.verificationData.reputationBoost}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified At:</span>
              <span>{new Date(verificationState.verificationData.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <Button onClick={resetVerification} variant="outline" className="w-full">
            Reset Verification
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Wallet Verification & Identity Linking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{verificationState.currentStep}/4 steps</span>
          </div>
          <Progress value={(verificationState.currentStep / 4) * 100} className="h-2" />
        </div>

        {/* Verification Steps */}
        <div className="space-y-3">
          {verificationSteps.map((step, index) => {
            const isCompleted = verificationState.currentStep > index
            const isCurrent = verificationState.currentStep === index + 1
            const Icon = step.icon

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : isCurrent 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  isCompleted 
                    ? 'bg-green-100 text-green-600' 
                    : isCurrent 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    isCompleted ? 'text-green-800' : isCurrent ? 'text-blue-800' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${
                    isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!address ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">Please connect your wallet to start verification</p>
              </div>
            </div>
          ) : verificationState.currentStep === 0 ? (
            <Button 
              onClick={handleStartVerification}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Verification...
                </>
              ) : (
                'Start Identity Verification'
              )}
            </Button>
          ) : verificationState.currentStep === 1 ? (
            <Button 
              onClick={handleScanQR}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating QR Code...
                </>
              ) : (
                'Generate QR Code'
              )}
            </Button>
          ) : verificationState.currentStep === 2 ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center space-y-3">
                <QrCode className="w-12 h-12 mx-auto text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Scan QR Code with Self App</p>
                  <p className="text-sm text-blue-600">Use your Self Protocol app to scan this QR code</p>
                </div>
                <Button 
                  onClick={handleLinkWallet}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Complete Verification'
                  )}
                </Button>
              </div>
            </div>
          ) : verificationState.currentStep === 3 ? (
            <Button 
              onClick={handleLinkWallet}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Linking Wallet...
                </>
              ) : (
                'Link Wallet to Identity'
              )}
            </Button>
          ) : null}
        </div>

        {/* Info */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> This verification is session-based and will reset when you disconnect your wallet or refresh the page.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
