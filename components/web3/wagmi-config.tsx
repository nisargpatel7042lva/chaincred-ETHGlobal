/* New: wagmi configuration (Sepolia + Injected wallet) */
"use client"

import { http, createConfig } from "wagmi"
import { sepolia, mainnet } from "wagmi/chains"
import { injected } from "wagmi/connectors"

// Keep it simple for hackathon: injected connector (MetaMask, browser wallets)
export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(), // default RPC; switch to a custom RPC if needed
    [mainnet.id]: http(),
  },
  connectors: [injected({ shimDisconnect: true })],
})
