/* New: Deterministic mock scoring helpers (replace later with The Graph + 0G) */
import { keccak256, toHex } from "viem"

export type ScoreBreakdown = {
  walletAge: number
  daoVotes: number
  defiTxs: number
}

export function pseudoScore(address: string): ScoreBreakdown {
  // Deterministic pseudo-random based on address
  const hash = keccak256(toHex(address))
  const nums = [
    Number.parseInt(hash.slice(2, 10), 16),
    Number.parseInt(hash.slice(10, 18), 16),
    Number.parseInt(hash.slice(18, 26), 16),
  ]

  const norm = (n: number) => n % 100
  return {
    walletAge: Math.max(5, norm(nums[0])), // 5-99
    daoVotes: Math.max(0, norm(nums[1])),
    defiTxs: Math.max(0, norm(nums[2])),
  }
}

export function combineScore(b: ScoreBreakdown): number {
  // Simple weighted formula (tweak later)
  const score = 0.4 * b.walletAge + 0.3 * b.daoVotes + 0.3 * b.defiTxs
  return Math.round(Math.min(100, Math.max(0, score)))
}
