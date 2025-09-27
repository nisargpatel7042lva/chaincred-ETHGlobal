/* New: wagmi configuration (Sepolia + Injected wallet) */
"use client"

import { http, createConfig } from "wagmi"
import { sepolia, mainnet, hardhat } from "wagmi/chains"
import { injected } from "wagmi/connectors"

// Simple configuration for reliable wallet connection
export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet, hardhat],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/demo"),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://mainnet.infura.io/v3/demo"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  connectors: [
    injected({ 
      shimDisconnect: true,
    }),
  ],
  ssr: true,
})
