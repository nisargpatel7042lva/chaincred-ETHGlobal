/* Rainbow Kit wagmi configuration with all Ethereum wallets */
"use client"

import { http, createConfig } from "wagmi"
import { sepolia, mainnet, hardhat, polygon, polygonMumbai } from "wagmi/chains"
import { 
  metaMask,
  walletConnect,
  coinbaseWallet,
  injected,
  safe
} from "wagmi/connectors"

// Safe RPC URLs with fallbacks
const getRpcUrl = (envVar: string | undefined, fallback: string): string => {
  // Check for invalid or placeholder URLs
  if (!envVar || 
      envVar.includes('YOUR_') || 
      envVar.includes('localhost:3001') ||
      envVar.includes('Mainnet%20RPC%20endpoint') ||
      envVar.includes('undefined') ||
      envVar.trim() === '') {
    console.log(`Using fallback RPC URL: ${fallback}`)
    return fallback
  }
  console.log(`Using environment RPC URL: ${envVar}`)
  return envVar
}

// Rainbow Kit compatible configuration
export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet, hardhat, polygon, polygonMumbai],
  transports: {
    [sepolia.id]: http(getRpcUrl(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL, "https://sepolia.infura.io/v3/demo")),
    [mainnet.id]: http(getRpcUrl(process.env.NEXT_PUBLIC_MAINNET_RPC_URL, "https://mainnet.infura.io/v3/demo")),
    [hardhat.id]: http("http://127.0.0.1:8545"),
    [polygon.id]: http(getRpcUrl(process.env.NEXT_PUBLIC_POLYGON_RPC_URL, "https://polygon-rpc.com")),
    [polygonMumbai.id]: http(getRpcUrl(process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL, "https://rpc-mumbai.maticvigil.com")),
  },
  connectors: [
    // MetaMask - Primary wallet connector
    metaMask({
      dappMetadata: {
        name: "ChainCred",
        url: "https://chaincred.vercel.app",
        iconUrl: "https://chaincred.vercel.app/logo.png",
      },
    }),
    
    // WalletConnect for mobile wallets and multi-wallet support
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
      metadata: {
        name: "ChainCred",
        description: "Ethereum Reputation Passport with Self Protocol",
        url: "https://chaincred.vercel.app",
        icons: ["https://chaincred.vercel.app/logo.png"],
      },
    }),
    
    // Coinbase Wallet
    coinbaseWallet({
      appName: "ChainCred",
      appLogoUrl: "https://chaincred.vercel.app/logo.png",
    }),
    
    // Safe Wallet
    safe(),
    
    // Injected connector for Phantom, Backpack, and other wallets
    // This will detect and show all available wallets in the browser
    injected({ 
      shimDisconnect: true,
    }),
  ],
  ssr: true,
})
