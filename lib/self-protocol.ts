/* Fresh Self Protocol Configuration - Following Official SDK */
// Based on: https://docs.self.xyz/use-self/quickstart

export const SELF_CONFIG = {
  // App Configuration
  APP_NAME: 'ChainCred',
  SCOPE: 'chaincred-reputation',
  LOGO_URL: 'https://chaincred.vercel.app/logo.png',
  
  // Contract Address for onchain verification (Self Protocol requirement)
  // This is the SelfProtocolVerifier contract address on Celo Alfajores
  CONTRACT_ADDRESS: '0x1234567890123456789012345678901234567890',
  
  // Endpoint Type - staging_celo for testing
  ENDPOINT_TYPE: 'staging_celo' as const,
  
  // User ID Type - hex for EVM addresses
  USER_ID_TYPE: 'hex' as const,
  
  // Self Protocol Version
  VERSION: 2,
  
  // Disclosures Configuration
  DISCLOSURES: {
    minimumAge: 18,
    excludedCountries: ['CUB', 'IRN', 'PRK', 'RUS'], // ISO 3166-1 alpha-3 codes
    nationality: true,
    gender: false,
    ofac: true
  }
}

// Callback URL helper - Use production URL for Self Protocol
export const getCallbackUrl = () => {
  // Use environment variable for production URL, fallback to localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  
  return `${baseUrl}/api/self-verify/callback`
}
