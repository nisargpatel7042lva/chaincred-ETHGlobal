/* Rainbow Kit wagmi configuration */
"use client"

import { http, createConfig } from "wagmi"
import { sepolia, mainnet, hardhat } from "wagmi/chains"
import { 
  metaMask,
  walletConnect,
  coinbaseWallet,
  injected,
  safe
} from "wagmi/connectors"

// Rainbow Kit compatible configuration
export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet, hardhat],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/demo"),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://mainnet.infura.io/v3/demo"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  connectors: [
    // MetaMask - Most popular Ethereum wallet
    metaMask({
      dappMetadata: {
        name: "ChainCred",
        url: "https://chaincred.vercel.app",
        iconUrl: "https://chaincred.vercel.app/logo.png",
      },
    }),
    
    // Coinbase Wallet
    coinbaseWallet({
      appName: "ChainCred",
      appLogoUrl: "https://chaincred.vercel.app/logo.png",
    }),
    
    // WalletConnect for mobile wallets (includes many wallets)
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
      showQrModal: true,
      metadata: {
        name: "ChainCred",
        description: "Decentralized reputation system",
        url: "https://chaincred.vercel.app",
        icons: ["https://chaincred.vercel.app/logo.png"],
      },
    }),
    
    // Safe wallet
    safe(),
    
    // Injected connector - This will detect Phantom, Backpack, and other injected wallets
    injected({ 
      shimDisconnect: true,
      target: 'metaMask', // This helps with MetaMask detection
    }),
    
    // Additional injected connector for other wallets
    injected({
      shimDisconnect: true,
      target: 'phantom',
    }),
    
    // Another injected connector for Backpack and other wallets
    injected({
      shimDisconnect: true,
      target: 'backpack',
    }),
  ],
  ssr: true,
})
