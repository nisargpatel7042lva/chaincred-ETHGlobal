/* Self Protocol Identity Verification Component */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface IdentityVerificationProps {
  walletAddress: string
  onVerificationComplete?: (identityData: any) => void
}

export function IdentityVerification({ walletAddress, onVerificationComplete }: IdentityVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<any>(null)
  const [proofType, setProofType] = useState<'passport' | 'id' | 'aadhaar'>('passport')
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'private' | 'anonymous'>('private')

  const handleVerification = async () => {
    if (!walletAddress) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch('/api/self-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          proofType,
          privacyLevel,
          requiredFields: ['country', 'age', 'isHuman', 'isNotSanctioned']
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setVerificationStatus(data)
      
      toast({
        title: "Identity Verified!",
        description: "Your identity has been successfully verified using Self Protocol",
      })

      if (onVerificationComplete) {
        onVerificationComplete(data.identity)
      }

    } catch (error) {
      console.error('Verification error:', error)
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify identity",
        variant: "destructive"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch(`/api/self-verify?address=${walletAddress}`)
      const data = await response.json()
      
      if (response.ok) {
        setVerificationStatus(data)
      }
    } catch (error) {
      console.error('Status check error:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔐 Identity Verification
          {verificationStatus?.verified && (
            <Badge variant="default" className="bg-green-500">
              Verified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verificationStatus?.verified ? (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Proof Type</label>
                <select
                  value={proofType}
                  onChange={(e) => setProofType(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="passport">Passport</option>
                  <option value="id">National ID</option>
                  <option value="aadhaar">Aadhaar Card</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Privacy Level</label>
                <select
                  value={privacyLevel}
                  onChange={(e) => setPrivacyLevel(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="private">Private (Recommended)</option>
                  <option value="public">Public</option>
                  <option value="anonymous">Anonymous</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-900">What we verify:</h4>
              <ul className="text-sm text-blue-800 mt-1 space-y-1">
                <li>• You are a human (not a bot)</li>
                <li>• You are not on sanctions lists</li>
                <li>• Your age (for compliance)</li>
                <li>• Your country (for jurisdiction)</li>
              </ul>
            </div>

            <Button
              onClick={handleVerification}
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? "Verifying Identity..." : "Verify Identity with Self Protocol"}
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              Powered by Self Protocol • Zero-knowledge proofs • Privacy-first
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded-md">
              <h4 className="font-medium text-green-900">Identity Verified!</h4>
              <div className="text-sm text-green-800 mt-1 space-y-1">
                <div>• Human: {verificationStatus.identity.isHuman ? "✅" : "❌"}</div>
                <div>• Not Sanctioned: {verificationStatus.identity.isNotSanctioned ? "✅" : "❌"}</div>
                <div>• Country: {verificationStatus.identity.country}</div>
                <div>• Age: {verificationStatus.identity.age}+</div>
                <div>• Privacy: {verificationStatus.identity.privacyLevel}</div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Proof Hash: {verificationStatus.identity.proofHash.slice(0, 16)}...
            </div>

            <Button
              onClick={checkVerificationStatus}
              variant="outline"
              className="w-full"
            >
              Refresh Status
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
