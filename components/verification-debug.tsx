/* Verification Debug Component - Clear stored verification data */
"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, AlertTriangle, CheckCircle } from "lucide-react"

export function VerificationDebug() {
  const { address } = useAccount()
  const [cleared, setCleared] = useState(false)

  const clearAllVerificationData = () => {
    if (!address) return

    // Clear all verification-related localStorage data
    const keysToRemove = [
      `verified_wallet_${address}`,
      `self_verification_${address}`,
      `reputation_data_${address}`,
      `zk_proof_${address}`,
      `identity_verification_${address}`
    ]

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const checkStoredData = () => {
    if (!address) return []

    const keys = [
      `verified_wallet_${address}`,
      `self_verification_${address}`,
      `reputation_data_${address}`,
      `zk_proof_${address}`,
      `identity_verification_${address}`
    ]

    return keys.map(key => ({
      key,
      exists: !!localStorage.getItem(key),
      data: localStorage.getItem(key)
    }))
  }

  const storedData = checkStoredData()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Verification Debug Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!address ? (
          <p className="text-sm text-muted-foreground">
            Connect your wallet to see debug information
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <h4 className="font-medium">Current Wallet: {address}</h4>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Stored Verification Data:</h5>
                {storedData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Badge variant={item.exists ? "destructive" : "secondary"}>
                      {item.exists ? "Found" : "Not Found"}
                    </Badge>
                    <span className="font-mono text-xs">{item.key}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">Clear All Verification Data</p>
                  <p className="text-orange-600">
                    This will remove all stored verification data for the current wallet. Use this to test the verification flow from scratch.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={clearAllVerificationData}
              variant="destructive"
              className="w-full"
              disabled={!storedData.some(item => item.exists)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Verification Data
            </Button>

            {cleared && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                All verification data cleared! Refresh the page to see the changes.
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p><strong>Note:</strong> This tool helps debug verification issues by clearing stored data.</p>
              <p>After clearing, you'll need to go through the complete verification flow again.</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
