/* Complete Verification Flow Page with Callback Handling */
"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { WalletConnect } from '@/components/wallet-connect'
import { VerificationFlow } from '@/components/verification-flow'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from 'next/link'

export default function VerificationPage() {
  const searchParams = useSearchParams()
  const [callbackStatus, setCallbackStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
    verificationId?: string
    userId?: string
  }>({ type: null, message: '' })

  useEffect(() => {
    const status = searchParams.get('status')
    const verificationId = searchParams.get('verification_id')
    const userId = searchParams.get('user_id')
    const error = searchParams.get('error')

    if (status === 'success' && verificationId && userId) {
      setCallbackStatus({
        type: 'success',
        message: 'Identity verification completed successfully!',
        verificationId,
        userId
      })
    } else if (status === 'error' || error) {
      setCallbackStatus({
        type: 'error',
        message: error || 'Verification failed. Please try again.'
      })
    }
  }, [searchParams])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Complete Verification Flow
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Connect wallet → Verify identity → Mint SBT
          </p>
        </div>

        {/* Callback Status Messages */}
        {callbackStatus.type && (
          <Card className={`max-w-2xl mx-auto mb-6 ${
            callbackStatus.type === 'success' 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                {callbackStatus.type === 'success' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    callbackStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {callbackStatus.type === 'success' ? 'Verification Successful!' : 'Verification Failed'}
                  </h3>
                  <p className={`text-sm ${
                    callbackStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {callbackStatus.message}
                  </p>
                  {callbackStatus.verificationId && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Verification ID: {callbackStatus.verificationId}</p>
                      <p>User ID: {callbackStatus.userId}</p>
                    </div>
                  )}
                </div>
                <Badge variant={callbackStatus.type === 'success' ? 'default' : 'destructive'}>
                  {callbackStatus.type === 'success' ? 'Success' : 'Error'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Flow */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Verification & SBT Minting
            </CardTitle>
            <CardDescription>
              Complete the verification process to mint your Reputation Passport SBT
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <WalletConnect />
            </div>
            <VerificationFlow />
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
