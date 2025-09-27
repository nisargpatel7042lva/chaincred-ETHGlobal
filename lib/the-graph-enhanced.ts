// enhanced-graph-service.ts
import { fetchWalletActivity } from "./the-graph";

type WalletActivity = {
  walletAgeDays: number;
  walletAgeYears: number;
  daoVotes: number;
  defiInteractions: number;
};

export class EnhancedGraphService {
  // Calculate reputation score (0-100)
  private calculateReputationScore(activity: WalletActivity): number {
    let score = 0;

    // Wallet age scoring
    if (activity.walletAgeDays > 7) score += 10; // avoid giving points to <7 days wallets
    if (activity.walletAgeYears >= 1) score += 20;
    if (activity.walletAgeYears >= 3) score += 20;

    // DAO participation
    if (activity.daoVotes > 0) score += 15;
    if (activity.daoVotes > 5) score += 15;

    // DeFi activity
    if (activity.defiInteractions > 0) score += 15;
    if (activity.defiInteractions > 10) score += 15;

    return Math.min(Math.round(score), 100);
  }

  // Human readable explanation
  private explainScore(activity: WalletActivity, score: number): string {
    const parts: string[] = [];

    if (activity.walletAgeYears >= 1) {
      parts.push(`Wallet age: ${activity.walletAgeYears} year${activity.walletAgeYears > 1 ? "s" : ""}`);
    } else if (activity.walletAgeDays > 0) {
      parts.push(`Wallet age: ${activity.walletAgeDays} day${activity.walletAgeDays > 1 ? "s" : ""}`);
    }

    if (activity.daoVotes > 0) {
      parts.push(`DAO votes: ${activity.daoVotes}`);
    }

    if (activity.defiInteractions > 0) {
      parts.push(`DeFi positions: ${activity.defiInteractions}`);
    }

    if (!parts.length) parts.push("New or inactive wallet");

    return `${score}/100 → ${parts.join(", ")}`;
  }

  // Public API
  async getEnhancedReputation(address: string) {
    const activity = await fetchWalletActivity(address);
    const score = this.calculateReputationScore(activity);
    const explanation = this.explainScore(activity, score);

    return {
      address,
      activity,
      score,
      explanation,
    };
  }
}

export const enhancedGraphService = new EnhancedGraphService();
