import { fetchWalletActivity } from "./the-graph";

export class EnhancedGraphService {
  // Scoring logic
  private calculateReputationScore(activity: any): number {
    let score = 0;

    // Age
    if (activity.walletAgeYears >= 1) score += 20;
    if (activity.walletAgeYears >= 3) score += 30;

    // DAO participation
    if (activity.daoVotes > 0) score += 20;
    if (activity.daoVotes > 5) score += 30;

    // DeFi activity
    if (activity.defiInteractions > 0) score += 20;
    if (activity.defiInteractions > 10) score += 30;

    return Math.min(score, 100);
  }

  // Explanation text (like AI layer)
  private explainScore(activity: any, score: number): string {
    const parts: string[] = [];

    if (activity.walletAgeYears >= 1)
      parts.push(`Wallet active for ${activity.walletAgeYears} years`);
    if (activity.daoVotes > 0)
      parts.push(`Voted in ${activity.daoVotes} DAO proposals`);
    if (activity.defiInteractions > 0)
      parts.push(`Engaged in ${activity.defiInteractions} DeFi positions`);

    if (!parts.length) parts.push("New or inactive wallet");

    return `${score}/100 → ${parts.join(", ")}`;
  }

  // Public entry point
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

// Export singleton
export const enhancedGraphService = new EnhancedGraphService();
