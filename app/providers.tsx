/* Rainbow Kit Global Providers for wagmi + React Query */
"use client"

import { type PropsWithChildren, useMemo, useState } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { wagmiConfig } from "@/components/web3/wagmi-config"
import { VerificationProvider } from "@/contexts/verification-context"

// Import Rainbow Kit styles
import "@rainbow-me/rainbowkit/styles.css"

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient())

  // Stable config instance
  const config = useMemo(() => wagmiConfig, [])

        return (
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider
                appInfo={{
                  appName: "ChainCred",
                  learnMoreUrl: "https://chaincred.vercel.app",
                }}
                initialChain={undefined} // Let users choose their preferred chain
                showRecentTransactions={true}
                modalSize="compact"
              >
                <VerificationProvider>
                  {children}
                </VerificationProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        )
}
