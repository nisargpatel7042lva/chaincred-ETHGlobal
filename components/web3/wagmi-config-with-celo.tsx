/* Rainbow Kit wagmi configuration with Celo for Self Protocol */
"use client"

import { http, createConfig } from "wagmi"
import { sepolia, mainnet, hardhat } from "wagmi/chains"
import { celo, celoAlfajores } from "wagmi/chains"
import { 
  metaMask,
  walletConnect,
  coinbaseWallet,
  injected,
  safe
} from "wagmi/connectors"

// Rainbow Kit compatible configuration with Celo support
export const wagmiConfigWithCelo = createConfig({
  chains: [
    // Ethereum chains
    sepolia, 
    mainnet, 
    hardhat,
    // Celo chains for Self Protocol
    celo,
    celoAlfajores
  ],
  transports: {
    // Ethereum RPC endpoints
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/demo"),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://mainnet.infura.io/v3/demo"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
    
    // Celo RPC endpoints for Self Protocol
    [celo.id]: http("https://forno.celo.org"),
    [celoAlfajores.id]: http("https://alfajores-forno.celo-testnet.org"),
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
    
    // WalletConnect for mobile wallets
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
    
    // Fallback injected connector for other wallets
    injected({ 
      shimDisconnect: true,
    }),
  ],
  ssr: true,
})
