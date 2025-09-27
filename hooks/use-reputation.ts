import useSWR from "swr"

type ScoreResponse = {
  address: string
  score: number
  breakdown: any
  explanation: string
  confidence?: number
  reasoning?: string[]
  recommendations?: string[]
  timestamp?: number
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useReputation(address?: string) {
  const { data, error, isLoading, mutate } = useSWR<ScoreResponse>(
    address ? `/api/score?address=${address}` : null,
    fetcher
  )
  return { data, error, isLoading, refresh: mutate }
}
