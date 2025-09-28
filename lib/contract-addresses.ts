/* Real Contract Addresses - Update after deployment */
// This file should be updated with real deployed contract addresses

export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet (for testing)
  sepolia: {
    ReputationOracle: '0x0000000000000000000000000000000000000000', // Update after deployment
    ReputationPassport: '0x0000000000000000000000000000000000000000', // Update after deployment
    SelfProtocolVerifier: '0x0000000000000000000000000000000000000000', // Update after deployment
    CrossChainReputation: '0x0000000000000000000000000000000000000000', // Update after deployment
  },
  
  // Mainnet (for production) - UPDATE THESE AFTER DEPLOYMENT
  mainnet: {
    ReputationOracle: process.env.NEXT_PUBLIC_REPUTATION_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000',
    ReputationPassport: process.env.NEXT_PUBLIC_REPUTATION_PASSPORT_ADDRESS || '0x0000000000000000000000000000000000000000',
    SelfProtocolVerifier: process.env.NEXT_PUBLIC_SELF_PROTOCOL_VERIFIER_ADDRESS || '0x0000000000000000000000000000000000000000',
    CrossChainReputation: process.env.NEXT_PUBLIC_CROSS_CHAIN_REPUTATION_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  
  // Polygon Mainnet (for low-cost transactions)
  polygon: {
    ReputationOracle: process.env.NEXT_PUBLIC_POLYGON_REPUTATION_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000',
    ReputationPassport: process.env.NEXT_PUBLIC_POLYGON_REPUTATION_PASSPORT_ADDRESS || '0x0000000000000000000000000000000000000000',
    SelfProtocolVerifier: process.env.NEXT_PUBLIC_POLYGON_SELF_PROTOCOL_VERIFIER_ADDRESS || '0x0000000000000000000000000000000000000000',
    CrossChainReputation: process.env.NEXT_PUBLIC_POLYGON_CROSS_CHAIN_REPUTATION_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  
  // Polygon Mumbai (for testing)
  polygonMumbai: {
    ReputationOracle: '0x0000000000000000000000000000000000000000', // Update after deployment
    ReputationPassport: '0x0000000000000000000000000000000000000000', // Update after deployment
    SelfProtocolVerifier: '0x0000000000000000000000000000000000000000', // Update after deployment
    CrossChainReputation: '0x0000000000000000000000000000000000000000', // Update after deployment
  },
  
  // Celo Alfajores (for Self Protocol)
  celoAlfajores: {
    ReputationOracle: '0x0000000000000000000000000000000000000000', // Update after deployment
    ReputationPassport: '0x0000000000000000000000000000000000000000', // Update after deployment
    SelfProtocolVerifier: '0x0000000000000000000000000000000000000000', // Update after deployment
    CrossChainReputation: '0x0000000000000000000000000000000000000000', // Update after deployment
  }
}

// Get contract address for current network
export function getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES.sepolia, chainId?: number): string {
  let networkKey: keyof typeof CONTRACT_ADDRESSES = 'sepolia' // default
  
  switch (chainId) {
    case 1:
      networkKey = 'mainnet'
      break
    case 11155111:
      networkKey = 'sepolia'
      break
    case 137:
      networkKey = 'polygon'
      break
    case 80001:
      networkKey = 'polygonMumbai'
      break
    case 44787:
      networkKey = 'celoAlfajores'
      break
    default:
      networkKey = 'sepolia'
  }
  
  const address = CONTRACT_ADDRESSES[networkKey][contractName]
  
  if (address === '0x0000000000000000000000000000000000000000') {
    console.warn(`⚠️ Contract ${contractName} not deployed on ${networkKey}. Please deploy contracts first.`)
    return '0x1234567890123456789012345678901234567890' // Return mock address for development
  }
  
  return address
}

// Get all contract addresses for current network
export function getAllContractAddresses(chainId?: number) {
  let networkKey: keyof typeof CONTRACT_ADDRESSES = 'sepolia' // default
  
  switch (chainId) {
    case 1:
      networkKey = 'mainnet'
      break
    case 11155111:
      networkKey = 'sepolia'
      break
    case 44787:
      networkKey = 'celoAlfajores'
      break
    default:
      networkKey = 'sepolia'
  }
  
  return CONTRACT_ADDRESSES[networkKey]
}

// Check if contracts are deployed
export function areContractsDeployed(chainId?: number): boolean {
  const addresses = getAllContractAddresses(chainId)
  return Object.values(addresses).every(addr => addr !== '0x0000000000000000000000000000000000000000')
}

// Get Etherscan URL for current network
export function getEtherscanUrl(chainId?: number): string {
  switch (chainId) {
    case 1:
      return 'https://etherscan.io'
    case 11155111:
      return 'https://sepolia.etherscan.io'
    case 137:
      return 'https://polygonscan.com'
    case 80001:
      return 'https://mumbai.polygonscan.com'
    case 56:
      return 'https://bscscan.com'
    case 97:
      return 'https://testnet.bscscan.com'
    case 42220:
      return 'https://celoscan.io'
    case 44787:
      return 'https://alfajores.celoscan.io'
    default:
      return 'https://etherscan.io'
  }
}
