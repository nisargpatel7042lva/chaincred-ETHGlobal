/* LocalStorage Inspector - Debug what's stored */
"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2 } from "lucide-react"

export function LocalStorageInspector() {
  const { address } = useAccount()
  const [storedData, setStoredData] = useState<Record<string, any>>({})

  const inspectLocalStorage = () => {
    if (!address) return

    const keys = [
      `verified_wallet_${address}`,
      `self_verification_${address}`,
      `reputation_data_${address}`,
      `zk_proof_${address}`,
      `identity_verification_${address}`
    ]

    const data: Record<string, any> = {}
    keys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          data[key] = JSON.parse(value)
        } catch {
          data[key] = value
        }
      }
    })

    setStoredData(data)
  }

  const clearAllData = () => {
    if (!address) return

    const keys = [
      `verified_wallet_${address}`,
      `self_verification_${address}`,
      `reputation_data_${address}`,
      `zk_proof_${address}`,
      `identity_verification_${address}`
    ]

    keys.forEach(key => {
      localStorage.removeItem(key)
    })

    setStoredData({})
  }

  useEffect(() => {
    inspectLocalStorage()
  }, [address])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          LocalStorage Inspector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!address ? (
          <p className="text-sm text-muted-foreground">Connect wallet to inspect data</p>
        ) : (
          <>
            <div className="flex gap-2">
              <Button onClick={inspectLocalStorage} size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={clearAllData} variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              {Object.keys(storedData).length === 0 ? (
                <p className="text-sm text-muted-foreground">No stored data found</p>
              ) : (
                Object.entries(storedData).map(([key, value]) => (
                  <div key={key} className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{key}</Badge>
                    </div>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
