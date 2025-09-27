/* Self Protocol Identity Verification API */

import { NextResponse } from "next/server"
import { selfProtocolRealService } from "@/lib/self-protocol-real"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { walletAddress, proofType, privacyLevel, requiredFields } = body

    if (!walletAddress || !proofType) {
      return NextResponse.json(
        { error: "Missing required fields: walletAddress, proofType" },
        { status: 400 }
      )
    }

    console.log(`🔐 Starting Self Protocol verification for ${walletAddress}...`)

    // Step 1: Generate zero-knowledge proof
    const proof = await selfProtocolRealService.generateIdentityProof({
      walletAddress,
      proofType,
      privacyLevel: privacyLevel || 'private',
      requiredFields: requiredFields || ['country', 'age', 'isHuman', 'isNotSanctioned']
    })

    // Step 2: Verify proof on Celo blockchain
    const verified = await selfProtocolRealService.verifyProofOnChain(proof, walletAddress)

    if (!verified) {
      return NextResponse.json(
        { error: "Identity verification failed" },
        { status: 400 }
      )
    }

    // Step 3: Extract identity data
    const identityData = await selfProtocolRealService.extractIdentityData(proof)

    // Step 4: Create Sybil-resistant profile
    const profile = await selfProtocolRealService.createSybilResistantProfile(
      walletAddress,
      identityData,
      { score: 0, breakdown: {} } // Will be updated with real reputation
    )

    return NextResponse.json({
      success: true,
      walletAddress,
      identity: {
        verified: true,
        country: identityData.country,
        age: identityData.age,
        isHuman: identityData.isHuman,
        isNotSanctioned: identityData.isNotSanctioned,
        privacyLevel: identityData.privacyLevel,
        proofHash: proof.verificationHash
      },
      profile,
      timestamp: Date.now(),
      network: 'celo-testnet'
    })

  } catch (error) {
    console.error("Self Protocol verification error:", error)
    
    return NextResponse.json(
      {
        error: "Identity verification failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now()
      },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const walletAddress = searchParams.get("address")

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Missing wallet address" },
      { status: 400 }
    )
  }

  try {
    const status = await selfProtocolRealService.getVerificationStatus(walletAddress)
    
    return NextResponse.json({
      walletAddress,
      ...status,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error("Self Protocol status check error:", error)
    
    return NextResponse.json(
      {
        error: "Failed to check verification status",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
