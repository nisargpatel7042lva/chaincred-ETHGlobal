/* Wallet Diagnostics Component - Debug wallet detection issues */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useConnections, useAccount } from "wagmi"

interface DiagnosticInfo {
  windowEthereum: boolean
  ethereumIsMetaMask: boolean
  ethereumProviders: any[]
  connections: any[]
  account: any
  userAgent: string
  isMetaMaskInstalled: boolean
}

export function WalletDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null)
  const connections = useConnections()
  const account = useAccount()

  useEffect(() => {
    const runDiagnostics = () => {
      const windowEthereum = !!(window as any).ethereum
      const ethereum = (window as any).ethereum
      const ethereumIsMetaMask = ethereum?.isMetaMask || false
      const ethereumProviders = ethereum?.providers || []
      const userAgent = navigator.userAgent
      
      // Check if MetaMask is installed by looking for the extension
      const isMetaMaskInstalled = !!(
        windowEthereum && 
        (ethereumIsMetaMask || 
         ethereumProviders.some((provider: any) => provider.isMetaMask))
      )

      setDiagnostics({
        windowEthereum,
        ethereumIsMetaMask,
        ethereumProviders,
        connections: connections || [],
        account,
        userAgent,
        isMetaMaskInstalled
      })
    }

    runDiagnostics()
    
    // Re-run diagnostics when connections change
    const interval = setInterval(runDiagnostics, 2000)
    
    return () => clearInterval(interval)
  }, [connections, account])

  const refreshDiagnostics = () => {
    window.location.reload()
  }

  if (!diagnostics) {
    return <div>Loading diagnostics...</div>
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Wallet Diagnostics</CardTitle>
        <CardDescription>
          Debug information for wallet detection issues
        </CardDescription>
        <Button onClick={refreshDiagnostics} variant="outline" size="sm">
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Detection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">window.ethereum exists</span>
            <Badge variant={diagnostics.windowEthereum ? "default" : "destructive"}>
              {diagnostics.windowEthereum ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">ethereum.isMetaMask</span>
            <Badge variant={diagnostics.ethereumIsMetaMask ? "default" : "destructive"}>
              {diagnostics.ethereumIsMetaMask ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">MetaMask Installed</span>
            <Badge variant={diagnostics.isMetaMaskInstalled ? "default" : "destructive"}>
              {diagnostics.isMetaMaskInstalled ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">Wagmi Connections</span>
            <Badge variant={diagnostics.connections.length > 0 ? "default" : "secondary"}>
              {diagnostics.connections.length}
            </Badge>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="space-y-3">
          <h4 className="font-medium">Detailed Information:</h4>
          
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>User Agent:</strong> {diagnostics.userAgent}
            </div>
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>Ethereum Providers:</strong> {diagnostics.ethereumProviders.length}
            </div>
            {diagnostics.ethereumProviders.length > 0 && (
              <div className="mt-2 text-xs">
                {diagnostics.ethereumProviders.map((provider, index) => (
                  <div key={index} className="ml-2">
                    Provider {index + 1}: {provider.isMetaMask ? "MetaMask" : "Other"}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>Wagmi Account:</strong> {account.isConnected ? "Connected" : "Not Connected"}
            </div>
            {account.isConnected && (
              <div className="mt-2 text-xs">
                <div>Address: {account.address}</div>
                <div>Chain: {account.chain?.name}</div>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>Available Connections:</strong>
            </div>
            {diagnostics.connections.length > 0 ? (
              <div className="mt-2 text-xs">
                {diagnostics.connections.map((conn, index) => (
                  <div key={index} className="ml-2">
                    {conn.connector.name} - {conn.connector.type}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-xs text-muted-foreground">
                No connections available
              </div>
            )}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Tips:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Make sure MetaMask extension is installed and enabled</li>
            <li>• Try refreshing the page after installing MetaMask</li>
            <li>• Check if MetaMask is unlocked</li>
            <li>• Try switching networks in MetaMask</li>
            <li>• Clear browser cache and reload</li>
            <li>• Check browser console for errors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
