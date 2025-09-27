/* 0G AI Integration for Enhanced Reputation Scoring */

export interface ZeroGAIResponse {
  explanation: string;
  confidence: number;
  reasoning: string[];
  recommendations: string[];
}

export interface WalletAnalysisData {
  address: string;
  score: number;
  breakdown: {
    walletAge: number;
    daoVotes: number;
    defiTxs: number;
    totalTxs?: number;
    uniqueContracts?: number;
    lastActivity?: number;
  };
}

/**
 * 0G AI Service for generating enhanced reputation explanations
 * This is a mock implementation that can be replaced with real 0G Labs integration
 */
export class ZeroGAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ZERO_G_API_KEY || "demo-key";
    this.baseUrl = process.env.ZERO_G_BASE_URL || "https://api.0g.ai/v1";
  }

  /**
   * Generate AI-powered reputation explanation using 0G compute
   */
  async generateReputationExplanation(data: WalletAnalysisData): Promise<ZeroGAIResponse> {
    try {
      // In a real implementation, this would call 0G Labs AI compute
      // For now, we'll use an enhanced local AI explanation
      return await this.mockZeroGAnalysis(data);
    } catch (error) {
      console.error("0G AI service error:", error);
      // Fallback to basic explanation
      return this.getFallbackExplanation(data);
    }
  }

  /**
   * Mock 0G AI analysis - replace with real 0G Labs API call
   */
  private async mockZeroGAnalysis(data: WalletAnalysisData): Promise<ZeroGAIResponse> {
    // Simulate 0G AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const { address, score, breakdown } = data;
    
    // Enhanced AI analysis based on on-chain data
    const analysis = this.performAdvancedAnalysis(breakdown, score);
    
    return {
      explanation: analysis.explanation,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      recommendations: analysis.recommendations,
    };
  }

  /**
   * Advanced analysis logic (simulating 0G AI capabilities)
   */
  private performAdvancedAnalysis(breakdown: any, score: number) {
    const { walletAge, daoVotes, defiTxs, totalTxs, uniqueContracts, lastActivity } = breakdown;
    
    let explanation = "";
    let confidence = 0.8;
    const reasoning: string[] = [];
    const recommendations: string[] = [];

    // Wallet Age Analysis
    if (walletAge > 365) {
      reasoning.push(`Strong wallet longevity: ${walletAge} days indicates established presence`);
      confidence += 0.1;
    } else if (walletAge > 90) {
      reasoning.push(`Moderate wallet age: ${walletAge} days shows some history`);
    } else {
      reasoning.push(`New wallet: ${walletAge} days suggests recent activity`);
      recommendations.push("Consider building longer transaction history");
    }

    // DAO Participation Analysis
    if (daoVotes > 10) {
      reasoning.push(`Active DAO participant: ${daoVotes} votes shows governance engagement`);
      confidence += 0.1;
    } else if (daoVotes > 0) {
      reasoning.push(`Some DAO participation: ${daoVotes} votes indicates governance interest`);
    } else {
      reasoning.push("No DAO participation detected");
      recommendations.push("Consider participating in DAO governance to improve reputation");
    }

    // DeFi Activity Analysis
    if (defiTxs > 50) {
      reasoning.push(`High DeFi activity: ${defiTxs} transactions shows active DeFi usage`);
      confidence += 0.1;
    } else if (defiTxs > 10) {
      reasoning.push(`Moderate DeFi activity: ${defiTxs} transactions indicates some DeFi engagement`);
    } else {
      reasoning.push("Limited DeFi activity");
      recommendations.push("Engage more with DeFi protocols to demonstrate expertise");
    }

    // Contract Diversity Analysis
    if (uniqueContracts && uniqueContracts > 20) {
      reasoning.push(`Diverse contract interactions: ${uniqueContracts} unique contracts shows broad ecosystem engagement`);
      confidence += 0.05;
    }

    // Recent Activity Analysis
    if (lastActivity) {
      const daysSinceLastActivity = (Date.now() / 1000 - lastActivity) / (24 * 60 * 60);
      if (daysSinceLastActivity < 7) {
        reasoning.push("Recent activity detected - wallet is actively used");
        confidence += 0.05;
      } else if (daysSinceLastActivity > 30) {
        reasoning.push("Limited recent activity - wallet may be dormant");
        recommendations.push("Maintain regular activity to keep reputation current");
      }
    }

    // Generate comprehensive explanation
    if (score >= 80) {
      explanation = `This wallet demonstrates excellent on-chain reputation with a score of ${score}/100. ${reasoning.slice(0, 2).join(" ")} The wallet shows strong engagement across multiple aspects of the Ethereum ecosystem.`;
    } else if (score >= 60) {
      explanation = `This wallet shows good on-chain reputation with a score of ${score}/100. ${reasoning.slice(0, 2).join(" ")} There's room for improvement in certain areas.`;
    } else if (score >= 40) {
      explanation = `This wallet has moderate on-chain reputation with a score of ${score}/100. ${reasoning.slice(0, 2).join(" ")} Consider the recommendations to improve your reputation score.`;
    } else {
      explanation = `This wallet has limited on-chain reputation with a score of ${score}/100. ${reasoning.slice(0, 2).join(" ")} Focus on building a stronger on-chain presence.`;
    }

    // Add recommendations if score is low
    if (score < 70 && recommendations.length > 0) {
      explanation += ` To improve your reputation: ${recommendations.slice(0, 2).join(", ")}.`;
    }

    return {
      explanation,
      confidence: Math.min(confidence, 0.95),
      reasoning,
      recommendations,
    };
  }

  /**
   * Fallback explanation when 0G AI is unavailable
   */
  private getFallbackExplanation(data: WalletAnalysisData): ZeroGAIResponse {
    const { score, breakdown } = data;
    
    return {
      explanation: `This wallet has a reputation score of ${score}/100 based on wallet age (${breakdown.walletAge} days), DAO votes (${breakdown.daoVotes}), and DeFi transactions (${breakdown.defiTxs}).`,
      confidence: 0.6,
      reasoning: [
        `Wallet age: ${breakdown.walletAge} days`,
        `DAO votes: ${breakdown.daoVotes}`,
        `DeFi transactions: ${breakdown.defiTxs}`,
      ],
      recommendations: [
        "Build longer transaction history",
        "Participate in DAO governance",
        "Engage with DeFi protocols",
      ],
    };
  }

  /**
   * Real 0G Labs API integration (placeholder for future implementation)
   */
  private async callZeroGAPI(data: WalletAnalysisData): Promise<ZeroGAIResponse> {
    // This would be the real 0G Labs API call
    const response = await fetch(`${this.baseUrl}/analyze-reputation`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet_address: data.address,
        score: data.score,
        on_chain_data: data.breakdown,
        analysis_type: "reputation_explanation",
      }),
    });

    if (!response.ok) {
      throw new Error(`0G API error: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Export singleton instance
export const zeroGAIService = new ZeroGAIService();
