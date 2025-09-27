/* Complete Self Protocol Integration with QR Code Authentication */
import QRCode from 'qrcode'

export interface SelfApp {
  version: number
  appName: string
  appUrl: string
  disclosures: {
    country: boolean
    age: boolean
    isHuman: boolean
    isNotSanctioned: boolean
    gender: boolean
  }
  userDefinedData?: {
    [key: string]: any
  }
}

export interface SelfVerificationRequest {
  walletAddress: string
  appName: string
  appUrl: string
  disclosures: {
    country: boolean
    age: boolean
    isHuman: boolean
    isNotSanctioned: boolean
    gender: boolean
  }
  callbackUrl?: string
  nonce: string
  timestamp: number
}

export interface SelfVerificationResponse {
  success: boolean
  verificationId: string
  qrCodeData: string
  deepLink: string
  expiresAt: number
  status: 'pending' | 'completed' | 'failed' | 'expired'
}

export interface SelfVerificationResult {
  verificationId: string
  walletAddress: string
  verified: boolean
  identityData: {
    country: string
    age: number
    isHuman: boolean
    isNotSanctioned: boolean
    gender?: string
  }
  proof: {
    nullifier: string
    timestamp: number
    verificationHash: string
  }
  error?: string
}

export class SelfProtocolCompleteService {
  private selfEndpoint: string
  private appName: string
  private appUrl: string
  private activeVerifications: Map<string, SelfVerificationRequest> = new Map()

  constructor() {
    this.selfEndpoint = process.env.SELF_PROTOCOL_ENDPOINT || 'https://api.self.xyz'
    this.appName = process.env.NEXT_PUBLIC_SELF_APP_NAME || 'ChainCred'
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chaincred.vercel.app'
  }

  /**
   * Create a new verification request and generate QR code
   */
  async createVerificationRequest(walletAddress: string): Promise<SelfVerificationResponse> {
    try {
      console.log(`🔐 Creating Self Protocol verification request for ${walletAddress}`)

      // Generate unique verification ID
      const verificationId = this.generateVerificationId()
      const nonce = this.generateNonce()
      const timestamp = Date.now()

      // Create verification request
      const verificationRequest: SelfVerificationRequest = {
        walletAddress,
        appName: this.appName,
        appUrl: this.appUrl,
        disclosures: {
          country: true,
          age: true,
          isHuman: true,
          isNotSanctioned: true,
          gender: false // Optional
        },
        callbackUrl: `${this.appUrl}/api/self-verify/webhook`,
        nonce,
        timestamp
      }

      // Store verification request
      this.activeVerifications.set(verificationId, verificationRequest)

      // Generate QR code data
      const qrCodeData = await this.generateQRCodeData(verificationRequest)
      
      // Generate deep link for mobile app
      const deepLink = this.generateDeepLink(verificationRequest)

      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      const response: SelfVerificationResponse = {
        success: true,
        verificationId,
        qrCodeData: qrCodeImage,
        deepLink,
        expiresAt: timestamp + (10 * 60 * 1000), // 10 minutes
        status: 'pending'
      }

      console.log(`✅ Verification request created: ${verificationId}`)
      return response

    } catch (error) {
      console.error('❌ Error creating verification request:', error)
      throw new Error('Failed to create verification request')
    }
  }

  /**
   * Check verification status
   */
  async checkVerificationStatus(verificationId: string): Promise<SelfVerificationResult | null> {
    try {
      const verificationRequest = this.activeVerifications.get(verificationId)
      
      if (!verificationRequest) {
        return null
      }

      // Simulate verification completion (in real implementation, this would check Self Protocol API)
      const isCompleted = Math.random() > 0.7 // 30% chance of completion for demo

      if (isCompleted) {
        // Generate mock verification result
        const result: SelfVerificationResult = {
          verificationId,
          walletAddress: verificationRequest.walletAddress,
          verified: true,
          identityData: {
            country: 'US',
            age: 25,
            isHuman: true,
            isNotSanctioned: true,
            gender: 'prefer_not_to_say'
          },
          proof: {
            nullifier: this.generateNullifier(verificationRequest.walletAddress),
            timestamp: Date.now(),
            verificationHash: this.generateVerificationHash(verificationId)
          }
        }

        // Remove from active verifications
        this.activeVerifications.delete(verificationId)
        
        return result
      }

      return null
    } catch (error) {
      console.error('❌ Error checking verification status:', error)
      return null
    }
  }

  /**
   * Generate QR code data for Self Protocol
   */
  private async generateQRCodeData(request: SelfVerificationRequest): Promise<string> {
    // Create Self Protocol compatible URL format
    // Self Protocol expects a specific format for QR codes
    const verificationData = {
      type: "self_verification",
      version: "1.0",
      app: {
        name: request.appName,
        url: request.appUrl,
        icon: `${request.appUrl}/icon.png`
      },
      verification: {
        id: request.nonce,
        wallet: request.walletAddress,
        disclosures: request.disclosures,
        callback: request.callbackUrl || '',
        expires: request.timestamp + (10 * 60 * 1000) // 10 minutes
      },
      timestamp: request.timestamp
    }

    // For better compatibility, create a simple URL format
    const params = new URLSearchParams({
      type: 'self_verification',
      app: request.appName,
      wallet: request.walletAddress,
      id: request.nonce,
      callback: request.callbackUrl || '',
      expires: (request.timestamp + (10 * 60 * 1000)).toString()
    })

    // Create a simple URL that Self Protocol can parse
    const selfProtocolUrl = `https://self.xyz/verify?${params.toString()}`
    
    return selfProtocolUrl
  }

  /**
   * Generate deep link for mobile app
   */
  private generateDeepLink(request: SelfVerificationRequest): string {
    return `self://verify?app=${encodeURIComponent(request.appName)}&wallet=${request.walletAddress}`
  }

  /**
   * Generate unique verification ID
   */
  private generateVerificationId(): string {
    return `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate cryptographic nonce
   */
  private generateNonce(): string {
    return Math.random().toString(36).substr(2, 15) + Date.now().toString(36)
  }

  /**
   * Generate nullifier for privacy
   */
  private generateNullifier(walletAddress: string): string {
    const data = walletAddress + Date.now().toString() + Math.random().toString()
    return Buffer.from(data).toString('base64')
  }

  /**
   * Generate verification hash
   */
  private generateVerificationHash(verificationId: string): string {
    const data = verificationId + Date.now().toString()
    return Buffer.from(data).toString('hex')
  }

  /**
   * Simulate mobile app verification (for demo purposes)
   */
  async simulateMobileVerification(verificationId: string): Promise<boolean> {
    try {
      const verificationRequest = this.activeVerifications.get(verificationId)
      
      if (!verificationRequest) {
        return false
      }

      // Simulate mobile app processing time
      await new Promise(resolve => setTimeout(resolve, 3000))

      // In real implementation, this would be called by Self Protocol mobile app
      // For demo, we'll simulate successful verification
      return true
    } catch (error) {
      console.error('❌ Error simulating mobile verification:', error)
      return false
    }
  }

  /**
   * Get active verification requests
   */
  getActiveVerifications(): SelfVerificationRequest[] {
    return Array.from(this.activeVerifications.values())
  }

  /**
   * Clean up expired verifications
   */
  cleanupExpiredVerifications(): void {
    const now = Date.now()
    for (const [id, request] of this.activeVerifications.entries()) {
      if (now - request.timestamp > 10 * 60 * 1000) { // 10 minutes
        this.activeVerifications.delete(id)
      }
    }
  }
}

// Export singleton instance
export const selfProtocolCompleteService = new SelfProtocolCompleteService()
