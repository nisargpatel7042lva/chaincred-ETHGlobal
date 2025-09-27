/* Self Protocol Webhook Handler */
import { NextRequest, NextResponse } from "next/server"
import { selfProtocolCompleteService } from "@/lib/self-protocol-complete"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    console.log("🔔 Self Protocol webhook received:", body)

    // Validate webhook signature (in production, verify with Self Protocol)
    const { verificationId, status, identityData, proof } = body

    if (!verificationId) {
      return NextResponse.json({ error: "Missing verification ID" }, { status: 400 })
    }

    // Handle different webhook events
    switch (status) {
      case "completed":
        // Verification completed successfully
        console.log(`✅ Verification ${verificationId} completed`)
        
        // Store verification result (in production, save to database)
        const verificationResult = {
          verificationId,
          walletAddress: body.walletAddress,
          verified: true,
          identityData: identityData || {
            country: "US",
            age: 25,
            isHuman: true,
            isNotSanctioned: true
          },
          proof: proof || {
            nullifier: `nullifier_${verificationId}`,
            timestamp: Date.now(),
            verificationHash: `hash_${verificationId}`
          }
        }

        // In production, you would:
        // 1. Save to database
        // 2. Update user's verification status
        // 3. Trigger any follow-up actions
        
        return NextResponse.json({ 
          success: true, 
          message: "Verification completed",
          verificationId 
        })

      case "failed":
        // Verification failed
        console.log(`❌ Verification ${verificationId} failed`)
        return NextResponse.json({ 
          success: true, 
          message: "Verification failed",
          verificationId 
        })

      case "expired":
        // Verification expired
        console.log(`⏰ Verification ${verificationId} expired`)
        return NextResponse.json({ 
          success: true, 
          message: "Verification expired",
          verificationId 
        })

      default:
        console.log(`📝 Verification ${verificationId} status: ${status}`)
        return NextResponse.json({ 
          success: true, 
          message: "Status updated",
          verificationId 
        })
    }

  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Health check endpoint
  return NextResponse.json({ 
    status: "healthy", 
    service: "Self Protocol Webhook",
    timestamp: new Date().toISOString()
  })
}
