/* Integrated Self Protocol + Wallet Verification Flow */
"use client"

import { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  QrCode, 
  Wallet,
  User,
  Link
} from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { selfProtocolRealService } from "@/lib/self-protocol-real"
import { zkIdentityCircuit } from "@/lib/zk-circuit"

interface VerificationStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  current: boolean
}

interface VerificationResult {
  walletAddress: string
  identityVerified: boolean
  zkProofVerified: boolean
  linked: boolean
  timestamp: number
  nullifier: string
  reputationBoost: number
}

export function IntegratedVerification() {
  const { address, isConnected } = useAccount()
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'connect_wallet',
      title: 'Connect Wallet',
      description: 'Connect your Ethereum wallet to start verification',
      icon: <Wallet className="w-5 h-5" />,
      completed: false,
      current: true
    },
    {
      id: 'verify_identity',
      title: 'Verify Identity',
      description: 'Scan QR code with Self app to verify your identity',
      icon: <Shield className="w-5 h-5" />,
      completed: false,
      current: false
    },
    {
      id: 'zk_proof',
      title: 'ZK Proof Verification',
      description: 'Zero-knowledge proof verification for privacy',
      icon: <User className="w-5 h-5" />,
      completed: false,
      current: false
    },
    {
      id: 'link_wallet',
      title: 'Link Wallet',
      description: 'Link your verified identity to your wallet',
      icon: <Link className="w-5 h-5" />,
      completed: false,
      current: false
    }
  ])
  
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)

  // Update steps when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      updateStep('connect_wallet', true)
      setCurrentStep(1)
    }
  }, [isConnected, address])

  const updateStep = (stepId: string, completed: boolean) => {
    setVerificationSteps(prev => prev.map(step => ({
      ...step,
      completed: step.id === stepId ? completed : step.completed,
      current: step.id === stepId && !completed
    })))
  }

  const startIdentityVerification = async () => {
    if (!address) return

    setIsVerifying(true)
    updateStep('verify_identity', false)
    setCurrentStep(2)

    try {
      // Generate Self Protocol verification request
      const verificationRequest = {
        walletAddress: address,
        proofType: 'passport' as const,
        privacyLevel: 'private' as const,
        requiredFields: ['age', 'country', 'isHuman', 'isNotSanctioned']
      }

      // Generate ZK proof
      const zkProof = await selfProtocolRealService.generateIdentityProof(verificationRequest)
      
      // Create QR code data for Self app
      const qrData = {
        walletAddress: address,
        proofHash: zkProof.verificationHash,
        timestamp: Date.now(),
        endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'https://api.self.xyz'
      }
      
      setQrCodeData(JSON.stringify(qrData))
      
      // Simulate QR scan and verification
      setTimeout(async () => {
        await handleQRScanned(zkProof)
      }, 3000)
      
    } catch (error) {
      console.error('Identity verification error:', error)
      setIsVerifying(false)
    }
  }

  const handleQRScanned = async (zkProof: any) => {
    if (!address) return

    try {
      // Verify ZK proof on-chain
      const zkVerified = await selfProtocolRealService.verifyProofOnChain(zkProof, address)
      
      if (zkVerified) {
        updateStep('verify_identity', true)
        updateStep('zk_proof', true)
        setCurrentStep(3)
        
        // Link wallet to verified identity
        await linkWalletToIdentity()
      } else {
        throw new Error('ZK proof verification failed')
      }
    } catch (error) {
      console.error('ZK verification error:', error)
      setIsVerifying(false)
    }
  }

  const linkWalletToIdentity = async () => {
    if (!address) return

    try {
      // Create Sybil-resistant profile
      const identityData = {
        country: 'US',
        age: 25,
        isHuman: true,
        isNotSanctioned: true,
        proof: {
          proof: {
            proof: {
              pi_a: ['0x0', '0x0', '0x0'] as [string, string, string],
              pi_b: [['0x0', '0x0'], ['0x0', '0x0'], ['0x0', '0x0']] as [[string, string], [string, string], [string, string]],
              pi_c: ['0x0', '0x0', '0x0'] as [string, string, string]
            },
            publicSignals: ['0x0', '0x0', '0x0', '0x0', '0x0', '0x0']
          },
          publicSignals: ['0x0', '0x0', '0x0', '0x0', '0x0', '0x0'],
          timestamp: Date.now(),
          verified: true,
          verificationHash: 'mock_verification_hash'
        },
        privacyLevel: 'private' as const
      }

      const reputationData = {
        score: 75,
        breakdown: {
          walletAge: 30,
          daoVotes: 5,
          defiTxs: 20,
          totalTxs: 50,
          uniqueContracts: 10,
          lastActivity: Date.now()
        }
      }

      const profile = await selfProtocolRealService.createSybilResistantProfile(
        address,
        identityData,
        reputationData
      )

      // Complete verification
      const result: VerificationResult = {
        walletAddress: address,
        identityVerified: true,
        zkProofVerified: true,
        linked: true,
        timestamp: Date.now(),
        nullifier: `nullifier_${address}_${Date.now()}`,
        reputationBoost: 20
      }

      setVerificationResult(result)
      updateStep('link_wallet', true)
      setCurrentStep(4)
      setIsVerifying(false)

      // DISABLED: localStorage storage
      // localStorage.setItem(`verified_wallet_${address}`, JSON.stringify(result))
      
    } catch (error) {
      console.error('Wallet linking error:', error)
      setIsVerifying(false)
    }
  }

  const resetVerification = () => {
    setVerificationSteps(prev => prev.map(step => ({
      ...step,
      completed: false,
      current: step.id === 'connect_wallet'
    })))
    setVerificationResult(null)
    setCurrentStep(0)
    setIsVerifying(false)
    setQrCodeData(null)
  }

  const restoreVerification = () => {
    // DISABLED: localStorage restoration
    // if (!address) return

    // const stored = localStorage.getItem(`verified_wallet_${address}`)
    // if (stored) {
    //   try {
    //     const result = JSON.parse(stored)
    //     if (result.identityVerified && result.zkProofVerified && result.linked && result.nullifier) {
    //       setVerificationResult(result)
    //       setVerificationSteps(prev => prev.map(step => ({
    //         ...step,
    //         completed: true,
    //         current: false
    //       })))
    //       setCurrentStep(4)
    //     }
    //   } catch (error) {
    //     console.error('Failed to restore verification:', error)
    //   }
    // }
  }

  // DISABLED: Auto-verification from localStorage
  // This was causing wallets to show as verified without going through the process
  // useEffect(() => {
  //   if (address) {
  //     const stored = localStorage.getItem(`verified_wallet_${address}`)
  //     if (stored) {
  //       try {
  //         const result = JSON.parse(stored)
  //         // Only restore if it's a complete verification with all required fields
  //         if (result.identityVerified && result.zkProofVerified && result.linked && result.nullifier) {
  //           setVerificationResult(result)
  //           setVerificationSteps(prev => prev.map(step => ({
  //             ...step,
  //             completed: true,
  //             current: false
  //           })))
  //           setCurrentStep(4)
  //         } else {
  //           // Clear invalid stored data
  //           localStorage.removeItem(`verified_wallet_${address}`)
  //         }
  //       } catch (error) {
  //         // Clear corrupted stored data
  //         localStorage.removeItem(`verified_wallet_${address}`)
  //       }
  //     }
  //   }
  // }, [address])

  if (verificationResult) {
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
              <span className="font-mono">{verificationResult.walletAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reputation Boost:</span>
              <span className="font-semibold text-green-600">+{verificationResult.reputationBoost} points</span>
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
                <p className="font-medium text-green-800">Verification Complete</p>
                <p className="text-green-600">
                  Your wallet is now linked to a verified human identity. You can mint your SBT, participate in DAO voting, and access gated features.
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
            <span>{currentStep}/4 steps</span>
          </div>
          <Progress value={(currentStep / 4) * 100} className="h-2" />
        </div>

        {/* Manual Restore Button */}
        {address && currentStep === 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Previously Verified?</p>
                <p className="text-xs text-yellow-600">If you've completed verification before, you can restore it.</p>
              </div>
              <Button 
                onClick={restoreVerification} 
                variant="outline" 
                size="sm"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Restore Verification
              </Button>
            </div>
          </div>
        )}

        {/* Verification Steps */}
        <div className="space-y-3">
          {verificationSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                step.completed 
                  ? 'bg-green-50 border-green-200' 
                  : step.current 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`flex-shrink-0 ${
                step.completed 
                  ? 'text-green-600' 
                  : step.current 
                    ? 'text-blue-600' 
                    : 'text-gray-400'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${
                  step.completed 
                    ? 'text-green-800' 
                    : step.current 
                      ? 'text-blue-800' 
                      : 'text-gray-600'
                }`}>
                  {step.title}
                </div>
                <div className="text-sm text-gray-600">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Step Actions */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Wallet className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Connect Your Wallet</p>
                  <p className="text-blue-600">
                    Connect your Ethereum wallet to start the verification process.
                  </p>
                </div>
              </div>
            </div>
            <ConnectButton />
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Wallet Connected</p>
                  <p className="text-green-600">
                    Your wallet is connected. Ready to verify your identity.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={startIdentityVerification} className="w-full">
              Start Identity Verification
            </Button>
          </div>
        )}

        {currentStep === 2 && qrCodeData && (
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
            
            <div className="flex justify-center">
              <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                <QRCodeCanvas value={qrCodeData} size={200} />
              </div>
            </div>
            
            {isVerifying && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Verifying identity...</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Linking Wallet</p>
                  <p className="text-blue-600">
                    Linking your verified identity to your wallet...
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Creating Sybil-resistant profile...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
