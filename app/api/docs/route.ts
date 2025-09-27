/* API Documentation Endpoint */
import { NextResponse } from "next/server"

export async function GET() {
  const apiDocs = {
    title: "Ethereum Reputation Passport API",
    version: "1.0.0",
    description: "Comprehensive API for reputation scoring, SBT minting, and on-chain data analysis",
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    endpoints: [
      {
        path: "/api/score",
        method: "GET",
        description: "Get reputation score and analysis for a wallet address",
        parameters: {
          address: {
            type: "string",
            required: true,
            description: "Ethereum wallet address (0x...)"
          }
        },
        response: {
          address: "string",
          score: "number (0-100)",
          breakdown: {
            walletAge: "number (days)",
            daoVotes: "number",
            defiTxs: "number",
            totalTxs: "number",
            uniqueContracts: "number",
            lastActivity: "number (timestamp)"
          },
          explanation: "string",
          confidence: "number (0-1)",
          reasoning: "string[]",
          recommendations: "string[]",
          timestamp: "number",
          dataSource: "string"
        },
        example: {
          request: "GET /api/score?address=0x1234...",
          response: {
            address: "0x1234...",
            score: 85,
            breakdown: {
              walletAge: 365,
              daoVotes: 15,
              defiTxs: 50,
              totalTxs: 200,
              uniqueContracts: 25,
              lastActivity: 1640995200
            },
            explanation: "This wallet demonstrates excellent on-chain reputation...",
            confidence: 0.92,
            reasoning: ["Strong wallet longevity", "Active DAO participant"],
            recommendations: ["Continue building reputation"],
            timestamp: 1640995200000,
            dataSource: "The Graph + 0G AI"
          }
        }
      },
      {
        path: "/api/health",
        method: "GET",
        description: "Check the health status of all backend services",
        response: {
          status: "string (healthy|degraded|down)",
          timestamp: "number",
          services: "BackendService[]",
          uptime: "number",
          version: "string",
          environment: "string"
        }
      },
      {
        path: "/api/monitoring",
        method: "GET",
        description: "Get comprehensive monitoring data for all services and pipelines",
        response: {
          system: {
            status: "string",
            uptime: "number",
            memory: "object",
            version: "string",
            environment: "string"
          },
          services: {
            health: "ServiceHealth",
            count: "number",
            active: "number",
            degraded: "number"
          },
          pipelines: {
            total: "number",
            active: "number",
            completed: "number",
            failed: "number",
            successRate: "number",
            avgProcessingTime: "number"
          },
          performance: {
            avgResponseTime: "number",
            lastHealthCheck: "number"
          },
          timestamp: "number"
        }
      }
    ],
    dataSources: [
      {
        name: "The Graph Protocol",
        description: "Decentralized indexing protocol for blockchain data",
        endpoints: [
          "Uniswap V3 Subgraph",
          "Token Transfer APIs",
          "DeFi Activity Indexing"
        ]
      },
      {
        name: "Etherscan API",
        description: "Ethereum blockchain explorer API",
        endpoints: [
          "Transaction History",
          "Wallet Balance",
          "Contract Interactions"
        ]
      },
      {
        name: "Snapshot API",
        description: "DAO governance platform API",
        endpoints: [
          "Voting History",
          "Proposal Data",
          "Delegation Information"
        ]
      },
      {
        name: "0G AI Compute",
        description: "Decentralized AI compute for analysis",
        endpoints: [
          "Reputation Analysis",
          "Confidence Scoring",
          "Recommendation Generation"
        ]
      }
    ],
    smartContracts: [
      {
        name: "ReputationOracle",
        description: "Central oracle for storing and validating reputation scores",
        functions: [
          "updateReputationScore()",
          "getReputationScore()",
          "invalidateReputationScore()",
          "isEligibleForSBT()"
        ]
      },
      {
        name: "ReputationPassport",
        description: "Soulbound Token (SBT) for reputation passports",
        functions: [
          "mintReputationPassport()",
          "burnReputationPassport()",
          "getTokenId()",
          "getWallet()"
        ]
      },
      {
        name: "ReputationGate",
        description: "Access control based on reputation scores",
        functions: [
          "createGate()",
          "checkAccess()",
          "updateGate()",
          "revokeAccess()"
        ]
      },
      {
        name: "CrossChainReputation",
        description: "Cross-chain reputation aggregation",
        functions: [
          "updateCrossChainReputation()",
          "getAggregatedReputation()",
          "setSupportedChain()"
        ]
      }
    ],
    scoring: {
      algorithm: "Multi-factor reputation scoring based on on-chain activity",
      factors: [
        {
          name: "Wallet Age",
          weight: "40%",
          description: "Time since first transaction"
        },
        {
          name: "DAO Participation",
          weight: "25%",
          description: "Number of governance votes"
        },
        {
          name: "DeFi Activity",
          weight: "20%",
          description: "DeFi protocol interactions"
        },
        {
          name: "Transaction Volume",
          weight: "10%",
          description: "Total transaction count"
        },
        {
          name: "Contract Diversity",
          weight: "5%",
          description: "Number of unique contracts"
        }
      ],
      bonuses: [
        "Recent activity bonus (+2 points)",
        "Dormant wallet penalty (-5 points)"
      ]
    },
    examples: {
      javascript: `
// Fetch reputation score
const response = await fetch('/api/score?address=0x1234...');
const data = await response.json();
console.log('Reputation Score:', data.score);
console.log('Explanation:', data.explanation);

// Check service health
const health = await fetch('/api/health');
const healthData = await health.json();
console.log('System Status:', healthData.status);
      `,
      curl: `
# Get reputation score
curl "http://localhost:3000/api/score?address=0x1234..."

# Check health
curl "http://localhost:3000/api/health"

# Get monitoring data
curl "http://localhost:3000/api/monitoring"
      `
    },
    rateLimits: {
      score: "100 requests per minute per IP",
      health: "1000 requests per minute per IP",
      monitoring: "60 requests per minute per IP"
    },
    authentication: {
      type: "None required for public endpoints",
      note: "Smart contract interactions require wallet connection"
    }
  }

  return NextResponse.json(apiDocs, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })
}
