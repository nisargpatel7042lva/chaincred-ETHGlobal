/* QR Code Compatibility Tester - Multiple Formats */
"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { qrCodeCompatibilityService, type QRCodeFormat } from "@/lib/qr-code-formats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Smartphone,
  Globe,
  Code,
  Zap
} from "lucide-react"

interface QRCodeResult {
  format: QRCodeFormat
  qrCodeData: string
  qrCodeImage: string
  compatibility: {
    canBeScanned: boolean
    potentialIssues: string[]
    recommendations: string[]
  }
}

export function QRCodeTester() {
  const { address } = useAccount()
  const [qrResults, setQrResults] = useState<QRCodeResult[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)

  const generateQRCodes = async () => {
    if (!address) return

    setIsGenerating(true)
    try {
      const data = {
        appName: "ChainCred",
        appUrl: "https://chaincred.vercel.app",
        walletAddress: address,
        nonce: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        callbackUrl: "https://chaincred.vercel.app/api/self-verify/webhook",
        disclosures: {
          country: true,
          age: true,
          isHuman: true,
          isNotSanctioned: true,
          gender: false
        },
        timestamp: Date.now()
      }

      const qrCodes = await qrCodeCompatibilityService.generateCompatibleQRCodes(data)
      
      const results = await Promise.all(
        qrCodes.map(async (qr) => {
          const compatibility = await qrCodeCompatibilityService.testQRCodeCompatibility(qr.qrCodeData)
          return {
            ...qr,
            compatibility
          }
        })
      )

      setQrResults(results)
      setSelectedFormat(results[0]?.format.name || null)
    } catch (error) {
      console.error("Error generating QR codes:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedResult = qrResults.find(r => r.format.name === selectedFormat)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Compatibility Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">QR Code Compatibility Testing</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This tool generates QR codes in multiple formats to ensure maximum compatibility with Self Protocol and other mobile apps.
                </p>
              </div>
            </div>
          </div>

          {!address ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">Please connect your wallet to generate QR codes</p>
            </div>
          ) : (
            <Button 
              onClick={generateQRCodes}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generating QR Codes..." : "Generate Compatible QR Codes"}
            </Button>
          )}
        </CardContent>
      </Card>

      {qrResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Available Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {qrResults.map((result) => (
                <div
                  key={result.format.name}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedFormat === result.format.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFormat(result.format.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{result.format.name}</h4>
                    <div className="flex items-center gap-2">
                      {result.compatibility.canBeScanned ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <Badge 
                        variant={result.compatibility.canBeScanned ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {result.compatibility.canBeScanned ? "Compatible" : "Issues"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.format.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {result.format.compatible.map((app) => (
                      <Badge key={app} variant="secondary" className="text-xs">
                        {app}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected QR Code */}
          {selectedResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  {selectedResult.format.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <img 
                      src={selectedResult.qrCodeImage} 
                      alt={`${selectedResult.format.name} QR Code`}
                      className="w-64 h-64"
                    />
                  </div>
                </div>

                {/* Compatibility Status */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {selectedResult.compatibility.canBeScanned ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {selectedResult.compatibility.canBeScanned ? "Compatible" : "Has Issues"}
                    </span>
                  </div>

                  {/* Issues */}
                  {selectedResult.compatibility.potentialIssues.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="font-medium text-red-800 mb-2">Potential Issues:</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        {selectedResult.compatibility.potentialIssues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedResult.compatibility.recommendations.length > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">Recommendations:</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        {selectedResult.compatibility.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* QR Code Data */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-2">QR Code Data:</h5>
                    <code className="text-xs text-gray-600 break-all">
                      {selectedResult.qrCodeData}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test QR Code Compatibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium">1. Test with Self Protocol</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Try scanning the QR code with the Self Protocol mobile app to see if it recognizes the format.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-green-600" />
                <h4 className="font-medium">2. Test with Other Apps</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Try scanning with other wallet apps or QR scanners to test general compatibility.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium">3. Check Data Format</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Review the QR code data format to ensure it matches what Self Protocol expects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
