/* Hypergraph Integration for Knowledge Graph Framework */

export interface KnowledgeGraphEntity {
  id: string
  type: string
  properties: Record<string, any>
  relationships: string[]
}

export interface KnowledgeGraphRelation {
  id: string
  source: string
  target: string
  type: string
  properties: Record<string, any>
}

/**
 * Hypergraph Knowledge Graph Integration
 * Using GRC-20 standard for structured data
 */
export class HypergraphService {
  private hypergraphEndpoint = "https://api.hypergraph.thegraph.com"
  private knowledgeGraphId = "ethereum-reputation-passport"

  /**
   * Publish reputation data to Knowledge Graph using GRC-20
   */
  async publishReputationData(walletData: any): Promise<void> {
    try {
      console.log(`📊 Publishing reputation data to Hypergraph...`)
      
      const entities = this.createReputationEntities(walletData)
      const relations = this.createReputationRelations(walletData)
      
      await Promise.all([
        this.publishEntities(entities),
        this.publishRelations(relations)
      ])
      
      console.log(`✅ Successfully published ${entities.length} entities and ${relations.length} relations`)
    } catch (error) {
      console.error('Hypergraph publish error:', error)
      throw error
    }
  }

  /**
   * Create structured entities for reputation data
   */
  private createReputationEntities(walletData: any): KnowledgeGraphEntity[] {
    const entities: KnowledgeGraphEntity[] = []

    // Wallet Entity
    entities.push({
      id: `wallet:${walletData.address}`,
      type: "Wallet",
      properties: {
        address: walletData.address,
        reputationScore: walletData.score,
        walletAge: walletData.breakdown.walletAge,
        daoVotes: walletData.breakdown.daoVotes,
        defiTxs: walletData.breakdown.defiTxs,
        totalTxs: walletData.breakdown.totalTxs,
        uniqueContracts: walletData.breakdown.uniqueContracts,
        lastActivity: walletData.breakdown.lastActivity,
        confidence: walletData.confidence,
        timestamp: walletData.timestamp
      },
      relationships: []
    })

    // DAO Entities (if any)
    if (walletData.daoVotes && walletData.daoVotes.length > 0) {
      walletData.daoVotes.forEach((vote: any, index: number) => {
        entities.push({
          id: `dao:${vote.daoId || `dao_${index}`}`,
          type: "DAO",
          properties: {
            name: vote.daoName || `DAO ${index}`,
            proposalId: vote.proposalId,
            voteType: vote.voteType,
            timestamp: vote.timestamp
          },
          relationships: [`wallet:${walletData.address}`]
        })
      })
    }

    // DeFi Protocol Entities
    if (walletData.defiProtocols && walletData.defiProtocols.length > 0) {
      walletData.defiProtocols.forEach((protocol: any, index: number) => {
        entities.push({
          id: `defi:${protocol.id || `protocol_${index}`}`,
          type: "DeFiProtocol",
          properties: {
            name: protocol.name,
            category: protocol.category,
            tvl: protocol.tvl,
            transactions: protocol.transactions,
            lastInteraction: protocol.lastInteraction
          },
          relationships: [`wallet:${walletData.address}`]
        })
      })
    }

    // SBT Entity (if eligible)
    if (walletData.score >= 70) {
      entities.push({
        id: `sbt:${walletData.address}`,
        type: "SoulboundToken",
        properties: {
          tokenId: `rep_${walletData.address}`,
          contractAddress: process.env.NEXT_PUBLIC_REPUTATION_PASSPORT_ADDRESS,
          mintedAt: Date.now(),
          score: walletData.score,
          explanation: walletData.explanation
        },
        relationships: [`wallet:${walletData.address}`]
      })
    }

    return entities
  }

  /**
   * Create relationships between entities
   */
  private createReputationRelations(walletData: any): KnowledgeGraphRelation[] {
    const relations: KnowledgeGraphRelation[] = []

    // Wallet -> DAO relationships
    if (walletData.daoVotes && walletData.daoVotes.length > 0) {
      walletData.daoVotes.forEach((vote: any, index: number) => {
        relations.push({
          id: `rel:wallet_dao_${index}`,
          source: `wallet:${walletData.address}`,
          target: `dao:${vote.daoId || `dao_${index}`}`,
          type: "PARTICIPATES_IN",
          properties: {
            voteCount: 1,
            lastVote: vote.timestamp,
            relationship: "governance_participant"
          }
        })
      })
    }

    // Wallet -> DeFi Protocol relationships
    if (walletData.defiProtocols && walletData.defiProtocols.length > 0) {
      walletData.defiProtocols.forEach((protocol: any, index: number) => {
        relations.push({
          id: `rel:wallet_defi_${index}`,
          source: `wallet:${walletData.address}`,
          target: `defi:${protocol.id || `protocol_${index}`}`,
          type: "INTERACTS_WITH",
          properties: {
            transactionCount: protocol.transactions,
            totalVolume: protocol.volume,
            lastInteraction: protocol.lastInteraction,
            relationship: "defi_user"
          }
        })
      })
    }

    // Wallet -> SBT relationship
    if (walletData.score >= 70) {
      relations.push({
        id: `rel:wallet_sbt`,
        source: `wallet:${walletData.address}`,
        target: `sbt:${walletData.address}`,
        type: "OWNS",
        properties: {
          mintedAt: Date.now(),
          score: walletData.score,
          relationship: "reputation_passport_holder"
        }
      })
    }

    return relations
  }

  /**
   * Publish entities to Hypergraph
   */
  private async publishEntities(entities: KnowledgeGraphEntity[]): Promise<void> {
    for (const entity of entities) {
      try {
        const response = await fetch(`${this.hypergraphEndpoint}/entities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HYPERGRAPH_API_KEY || 'demo'}`,
          },
          body: JSON.stringify({
            graphId: this.knowledgeGraphId,
            entity: {
              id: entity.id,
              type: entity.type,
              properties: entity.properties,
              relationships: entity.relationships
            }
          }),
        })

        if (!response.ok) {
          console.warn(`Failed to publish entity ${entity.id}:`, response.statusText)
        }
      } catch (error) {
        console.warn(`Error publishing entity ${entity.id}:`, error)
      }
    }
  }

  /**
   * Publish relations to Hypergraph
   */
  private async publishRelations(relations: KnowledgeGraphRelation[]): Promise<void> {
    for (const relation of relations) {
      try {
        const response = await fetch(`${this.hypergraphEndpoint}/relations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HYPERGRAPH_API_KEY || 'demo'}`,
          },
          body: JSON.stringify({
            graphId: this.knowledgeGraphId,
            relation: {
              id: relation.id,
              source: relation.source,
              target: relation.target,
              type: relation.type,
              properties: relation.properties
            }
          }),
        })

        if (!response.ok) {
          console.warn(`Failed to publish relation ${relation.id}:`, response.statusText)
        }
      } catch (error) {
        console.warn(`Error publishing relation ${relation.id}:`, error)
      }
    }
  }

  /**
   * Query the Knowledge Graph for reputation insights
   */
  async queryReputationInsights(query: string): Promise<any> {
    try {
      console.log(`🔍 Querying Hypergraph: ${query}`)
      
      const response = await fetch(`${this.hypergraphEndpoint}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HYPERGRAPH_API_KEY || 'demo'}`,
        },
        body: JSON.stringify({
          graphId: this.knowledgeGraphId,
          query: query,
          limit: 100
        }),
      })

      if (!response.ok) {
        throw new Error(`Hypergraph query failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Hypergraph query error:', error)
      throw error
    }
  }

  /**
   * Get reputation network analysis
   */
  async getReputationNetwork(address: string): Promise<any> {
    const query = `
      MATCH (w:Wallet {address: "${address}"})-[r]-(connected)
      RETURN w, r, connected
      LIMIT 50
    `
    
    return await this.queryReputationInsights(query)
  }

  /**
   * Get similar wallets based on reputation patterns
   */
  async getSimilarWallets(address: string): Promise<any> {
    const query = `
      MATCH (w:Wallet {address: "${address}"})
      MATCH (similar:Wallet)
      WHERE similar.reputationScore >= w.reputationScore - 10 
        AND similar.reputationScore <= w.reputationScore + 10
        AND similar.address <> "${address}"
      RETURN similar
      ORDER BY abs(similar.reputationScore - w.reputationScore)
      LIMIT 10
    `
    
    return await this.queryReputationInsights(query)
  }

  /**
   * Get DAO participation network
   */
  async getDAONetwork(address: string): Promise<any> {
    const query = `
      MATCH (w:Wallet {address: "${address}"})-[:PARTICIPATES_IN]->(dao:DAO)
      MATCH (dao)<-[:PARTICIPATES_IN]-(other:Wallet)
      RETURN dao, other
      LIMIT 20
    `
    
    return await this.queryReputationInsights(query)
  }
}

// Export singleton instance
export const hypergraphService = new HypergraphService()
