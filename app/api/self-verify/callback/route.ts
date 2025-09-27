/* Fresh Self Protocol Callback API Endpoint */
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 Self Protocol callback received (GET)')
    
    // Get query parameters from the callback URL
    const { searchParams } = new URL(request.url)
    const verificationId = searchParams.get('verification_id')
    const status = searchParams.get('status')
    const userId = searchParams.get('user_id')
    const error = searchParams.get('error')
    
    console.log('📋 Callback parameters:', {
      verificationId,
      status,
      userId,
      error
    })
    
    // Handle successful verification
    if (status === 'success' && verificationId && userId) {
      console.log('✅ Verification successful for user:', userId)
      
      // In a real implementation, you would:
      // 1. Verify the proof on your backend
      // 2. Store the verification result
      // 3. Update user status in your database
      // 4. Trigger any follow-up actions (SBT minting, etc.)
      
      return NextResponse.json({
        success: true,
        message: 'Verification successful',
        verificationId,
        userId,
        timestamp: new Date().toISOString()
      })
    }
    
    // Handle failed verification
    if (status === 'error' || error) {
      console.log('❌ Verification failed:', error)
      
      return NextResponse.json({
        success: false,
        message: 'Verification failed',
        error: error || 'Unknown error',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }
    
    // Handle other cases
    return NextResponse.json({
      success: false,
      message: 'Invalid callback parameters',
      timestamp: new Date().toISOString()
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Error processing Self Protocol callback:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Self Protocol callback received (POST)')
    
    const body = await request.json()
    console.log('📋 Callback body:', body)
    
    // Handle different types of callbacks
    if (body.type === 'verification_success') {
      console.log('✅ Verification success callback:', body)
      
      return NextResponse.json({
        success: true,
        message: 'Verification success processed',
        data: body,
        timestamp: new Date().toISOString()
      })
    }
    
    if (body.type === 'verification_error') {
      console.log('❌ Verification error callback:', body)
      
      return NextResponse.json({
        success: false,
        message: 'Verification error processed',
        error: body.error,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Unknown callback type',
      timestamp: new Date().toISOString()
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Error processing Self Protocol POST callback:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}