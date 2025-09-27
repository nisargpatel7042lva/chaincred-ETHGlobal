/* New: SWR hook for reputation data */
"use client"

import useSWR from "swr"

type ScoreResponse = {
  address: string
  score: number
  breakdown: {
    walletAge: number
    daoVotes: number
    defiTxs: number
    totalTxs?: number
    uniqueContracts?: number
    lastActivity?: number
  }
  explanation: string
  confidence?: number
  reasoning?: string[]
  recommendations?: string[]
  timestamp?: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useReputation(address?: string) {
  const shouldFetch = !!address
  const { data, error, isLoading, mutate } = useSWR<ScoreResponse>(
    shouldFetch ? `/api/score?address=${address}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  }
}
