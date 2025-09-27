/* Multiple QR Code Formats for Maximum Compatibility */
import QRCode from 'qrcode'

export interface QRCodeFormat {
  name: string
  description: string
  generate: (data: any) => string
  compatible: string[]
}

export class QRCodeCompatibilityService {
  private formats: QRCodeFormat[] = []

  constructor() {
    this.initializeFormats()
  }

  private initializeFormats() {
    this.formats = [
      // Format 1: Self Protocol Official Format (if available)
      {
        name: "Self Protocol Official",
        description: "Official Self Protocol deep link format",
        compatible: ["Self Protocol Mobile App"],
        generate: (data) => {
          // This would be the official format if Self Protocol published it
          return `self://verify/${Buffer.from(JSON.stringify(data)).toString('base64')}`
        }
      },

      // Format 2: WalletConnect Style (Most Compatible)
      {
        name: "WalletConnect Style",
        description: "WalletConnect compatible format - widely supported",
        compatible: ["Self Protocol", "WalletConnect", "Most Mobile Wallets"],
        generate: (data) => {
          const wcData = {
            protocol: "self",
            version: "1",
            topic: data.nonce,
            bridge: "https://self.xyz/bridge",
            key: data.nonce,
            app: {
              name: data.appName,
              url: data.appUrl
            },
            wallet: data.walletAddress,
            disclosures: data.disclosures
          }
          return `wc:${Buffer.from(JSON.stringify(wcData)).toString('base64')}@1?bridge=https://self.xyz/bridge&key=${data.nonce}`
        }
      },

      // Format 3: Universal Link Format
      {
        name: "Universal Link",
        description: "Standard web URL that can be opened by any app",
        compatible: ["All Apps", "Web Browsers", "Mobile Apps"],
        generate: (data) => {
          const params = new URLSearchParams({
            action: 'verify',
            app: data.appName,
            wallet: data.walletAddress,
            id: data.nonce,
            callback: data.callbackUrl || '',
            expires: (data.timestamp + (10 * 60 * 1000)).toString()
          })
          return `https://self.xyz/verify?${params.toString()}`
        }
      },

      // Format 4: JSON Data Format
      {
        name: "JSON Data",
        description: "Raw JSON data that apps can parse",
        compatible: ["Custom Apps", "Development Testing"],
        generate: (data) => {
          return JSON.stringify({
            type: "self_verification",
            version: "1.0",
            app: {
              name: data.appName,
              url: data.appUrl
            },
            verification: {
              id: data.nonce,
              wallet: data.walletAddress,
              disclosures: data.disclosures,
              callback: data.callbackUrl || '',
              expires: data.timestamp + (10 * 60 * 1000)
            },
            timestamp: data.timestamp
          })
        }
      },

      // Format 5: Simple URL Format
      {
        name: "Simple URL",
        description: "Simple URL format for basic compatibility",
        compatible: ["Basic Apps", "Web Browsers"],
        generate: (data) => {
          return `https://chaincred.vercel.app/verify?wallet=${data.walletAddress}&id=${data.nonce}`
        }
      }
    ]
  }

  /**
   * Generate QR codes in multiple formats for maximum compatibility
   */
  async generateCompatibleQRCodes(data: any): Promise<{
    format: QRCodeFormat
    qrCodeData: string
    qrCodeImage: string
  }[]> {
    const results = []

    for (const format of this.formats) {
      try {
        const qrData = format.generate(data)
        const qrImage = await QRCode.toDataURL(qrData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })

        results.push({
          format,
          qrCodeData: qrData,
          qrCodeImage: qrImage
        })
      } catch (error) {
        console.error(`Error generating QR code for format ${format.name}:`, error)
      }
    }

    return results
  }

  /**
   * Get the most compatible format (WalletConnect style)
   */
  getMostCompatibleFormat(): QRCodeFormat {
    return this.formats.find(f => f.name === "WalletConnect Style") || this.formats[0]
  }

  /**
   * Get all available formats
   */
  getAllFormats(): QRCodeFormat[] {
    return this.formats
  }

  /**
   * Test QR code compatibility
   */
  async testQRCodeCompatibility(qrData: string): Promise<{
    canBeScanned: boolean
    potentialIssues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check if QR code data is too long
    if (qrData.length > 2000) {
      issues.push("QR code data is too long - may not scan properly")
      recommendations.push("Use shorter data format or split into multiple QR codes")
    }

    // Check if QR code data contains special characters
    if (!/^[a-zA-Z0-9:\/\.\?\=\&\-\+]+$/.test(qrData)) {
      issues.push("QR code contains special characters that may cause scanning issues")
      recommendations.push("Use URL-safe encoding")
    }

    // Check if it's a valid URL format
    try {
      new URL(qrData)
      recommendations.push("Valid URL format - should work with most QR scanners")
    } catch {
      issues.push("Not a valid URL format")
      recommendations.push("Consider using URL format for better compatibility")
    }

    return {
      canBeScanned: issues.length === 0,
      potentialIssues: issues,
      recommendations
    }
  }
}

// Export singleton
export const qrCodeCompatibilityService = new QRCodeCompatibilityService()
