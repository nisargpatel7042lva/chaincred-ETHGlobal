/* New: Global Providers for wagmi + React Query */
"use client"

import { type PropsWithChildren, useMemo, useState } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiConfig } from "@/components/web3/wagmi-config"

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient())

  // Stable config instance
  const config = useMemo(() => wagmiConfig, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
