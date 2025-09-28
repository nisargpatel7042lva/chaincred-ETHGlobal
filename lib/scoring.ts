/* Enhanced Scoring System with Real The Graph Data */
import { keccak256, toHex } from "viem"
import { fetchWalletActivity, calculateReputationScore, type WalletActivity } from "./the-graph"

export type ScoreBreakdown = {
  walletAge: number
  daoVotes: number
  defiTxs: number
  totalTxs?: number
  uniqueContracts?: number
  lastActivity?: number
}

/**
 * Get real wallet score using The Graph data
 */
export async function getWalletScore(address: string): Promise<{
  score: number
  breakdown: ScoreBreakdown
  activity: WalletActivity
}> {
  try {
    console.log(`Calculating real score for ${address}...`);
    
    // Fetch real on-chain data from The Graph
    const activity = await fetchWalletActivity(address)
    const score = calculateReputationScore(activity)
    
    const breakdown: ScoreBreakdown = {
      walletAge: activity.walletAge,
      daoVotes: activity.daoVotes,
      defiTxs: activity.defiTxs,
      totalTxs: activity.totalTxs,
      uniqueContracts: activity.uniqueContracts,
      lastActivity: activity.lastActivity,
    }
    
    return { score, breakdown, activity }
  } catch (error) {
    console.error('Error getting wallet score:', error)
    // Fallback to pseudo-scoring if The Graph fails
    return getFallbackScore(address)
  }
}

/**
 * Fallback pseudo-scoring when The Graph is unavailable
 */
function getFallbackScore(address: string): {
  score: number
  breakdown: ScoreBreakdown
  activity: WalletActivity
} {
  const breakdown = pseudoScore(address)
  const score = combineScore(breakdown)
  
  const activity: WalletActivity = {
    walletAge: breakdown.walletAge,
    daoVotes: breakdown.daoVotes,
    defiTxs: breakdown.defiTxs,
    totalTxs: Math.max(10, breakdown.walletAge + breakdown.daoVotes),
    uniqueContracts: Math.max(1, Math.floor(breakdown.defiTxs / 10)),
    lastActivity: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 30 * 24 * 60 * 60),
  }
  
  return { score, breakdown, activity }
}

/**
 * Legacy pseudo-scoring function (kept for fallback)
 */
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

/**
 * Enhanced fair scoring algorithm with multiple paths to reputation
 */
export function combineScore(b: ScoreBreakdown): number {
  // Multiple scoring paths to ensure fairness
  const paths = [
    calculateTraditionalPath(b),    // Traditional on-chain activity
    calculateNewUserPath(b),        // New user friendly path
    calculateCommunityPath(b),      // Community participation path
    calculateDeFiPath(b),           // DeFi specialist path
    calculateLegacyUserPath(b),     // Legacy user path (for idle old wallets)
  ]
  
  // Take the highest score from any path
  const maxScore = Math.max(...paths)
  
  // Apply fairness adjustments
  const adjustedScore = applyFairnessAdjustments(maxScore, b)
  
  return Math.round(Math.min(100, Math.max(0, adjustedScore)))
}

/**
 * Traditional scoring path (existing users)
 */
function calculateTraditionalPath(b: ScoreBreakdown): number {
  return 0.3 * b.walletAge + 0.25 * b.daoVotes + 0.25 * b.defiTxs + 0.2 * (b.totalTxs || 0)
}

/**
 * New user friendly path (recent wallets)
 */
function calculateNewUserPath(b: ScoreBreakdown): number {
  // New users can get up to 60 points through activity
  const activityScore = Math.min(60, (b.defiTxs * 3) + (b.daoVotes * 5))
  
  // Bonus for recent activity
  const recentActivityBonus = (b.lastActivity || 0) > (Date.now() / 1000 - 7 * 24 * 60 * 60) ? 10 : 0
  
  return activityScore + recentActivityBonus
}

/**
 * Community participation path
 */
function calculateCommunityPath(b: ScoreBreakdown): number {
  // DAO participation is heavily weighted
  const daoScore = Math.min(50, b.daoVotes * 8)
  
  // Contract diversity shows engagement
  const diversityScore = Math.min(20, (b.uniqueContracts || 0) * 2)
  
  // Wallet age still matters but less
  const ageScore = Math.min(30, b.walletAge * 0.5)
  
  return daoScore + diversityScore + ageScore
}

/**
 * DeFi specialist path
 */
function calculateDeFiPath(b: ScoreBreakdown): number {
  // Heavy DeFi activity
  const defiScore = Math.min(60, b.defiTxs * 4)
  
  // Contract diversity in DeFi
  const diversityScore = Math.min(25, (b.uniqueContracts || 0) * 3)
  
  // Some age requirement but not too strict
  const ageScore = Math.min(15, b.walletAge * 0.3)
  
  return defiScore + diversityScore + ageScore
}

/**
 * Legacy user path (for old wallets that might be idle)
 */
function calculateLegacyUserPath(b: ScoreBreakdown): number {
  // Only applies to wallets older than 1 year
  if (b.walletAge < 365) return 0
  
  // Base score for being a long-term user
  let score = 30 // Base score for 1+ year old wallet
  
  // Additional points for very old wallets
  if (b.walletAge > 730) score += 20 // 2+ years
  if (b.walletAge > 1095) score += 15 // 3+ years
  if (b.walletAge > 1460) score += 10 // 4+ years
  
  // Bonus for any historical activity (even if old)
  if (b.daoVotes > 0) score += 15 // Any DAO participation
  if (b.defiTxs > 0) score += 10 // Any DeFi activity
  if ((b.totalTxs || 0) > 50) score += 10 // Decent transaction history
  
  // Bonus for contract diversity (shows they've used various protocols)
  if ((b.uniqueContracts || 0) > 5) score += 10
  
  // Small penalty for completely inactive wallets (no activity in 2+ years)
  const twoYearsAgo = Date.now() / 1000 - (2 * 365 * 24 * 60 * 60)
  if ((b.lastActivity || 0) < twoYearsAgo) {
    score = Math.max(25, score - 15) // Minimum 25 for very old wallets
  }
  
  return Math.min(score, 80) // Cap at 80 for legacy users
}

/**
 * Apply fairness adjustments to prevent exclusion
 */
function applyFairnessAdjustments(score: number, b: ScoreBreakdown): number {
  let adjustedScore = score
  
  // Minimum score guarantee for active wallets
  if ((b.defiTxs > 0 || b.daoVotes > 0) && b.walletAge > 0) {
    adjustedScore = Math.max(adjustedScore, 25) // Minimum 25 for any activity
  }
  
  // New user boost (wallets < 30 days old)
  if (b.walletAge < 30 && (b.defiTxs > 5 || b.daoVotes > 1)) {
    adjustedScore += 15 // Boost for new active users
  }
  
  // Long-term user bonus
  if (b.walletAge > 365) {
    adjustedScore += 10 // Bonus for 1+ year old wallets
  }
  
  // High activity bonus
  if ((b.totalTxs || 0) > 100) {
    adjustedScore += 5 // Bonus for high transaction volume
  }
  
  // Legacy user protection (for idle old wallets)
  if (b.walletAge > 365) {
    // Ensure old wallets get a decent minimum score even if idle
    const oneYearAgo = Date.now() / 1000 - (365 * 24 * 60 * 60)
    const isRecentlyInactive = (b.lastActivity || 0) < oneYearAgo
    
    if (isRecentlyInactive) {
      // Still give them a reasonable score based on wallet age
      const legacyMinimum = Math.min(40, 20 + (b.walletAge / 365) * 5)
      adjustedScore = Math.max(adjustedScore, legacyMinimum)
    }
  }
  
  // Identity verification bonus (if they complete Self Protocol verification)
  // This would be added when they actually verify their identity
  // adjustedScore += 20 // Bonus for completing identity verification
  
  return adjustedScore
}
