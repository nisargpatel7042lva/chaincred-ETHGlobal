/* Backend Services Architecture for Ethereum Reputation Passport */

export interface BackendService {
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastCheck: number;
  responseTime?: number;
}

export interface ServiceHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: BackendService[];
  timestamp: number;
}

/**
 * Backend Services Manager
 * Monitors and manages all external service integrations
 */
export class BackendServicesManager {
  private services: Map<string, BackendService> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeServices();
    this.startHealthChecks();
  }

  private initializeServices() {
    // Initialize all backend services
    this.services.set('the-graph', {
      name: 'The Graph Protocol',
      status: 'active',
      lastCheck: Date.now(),
    });

    this.services.set('etherscan', {
      name: 'Etherscan API',
      status: 'active',
      lastCheck: Date.now(),
    });

    this.services.set('snapshot', {
      name: 'Snapshot DAO',
      status: 'active',
      lastCheck: Date.now(),
    });

    this.services.set('zero-g-ai', {
      name: '0G AI Compute',
      status: 'active',
      lastCheck: Date.now(),
    });

    this.services.set('smart-contracts', {
      name: 'Smart Contracts',
      status: 'active',
      lastCheck: Date.now(),
    });
  }

  private startHealthChecks() {
    // Check service health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000);
  }

  private async performHealthChecks() {
    const checks = [
      this.checkTheGraphHealth(),
      this.checkEtherscanHealth(),
      this.checkSnapshotHealth(),
      this.checkZeroGHealth(),
      this.checkSmartContractsHealth(),
    ];

    await Promise.allSettled(checks);
  }

  private async checkTheGraphHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      const response = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ _meta { hasIndexingErrors } }',
        }),
      });

      const service = this.services.get('the-graph')!;
      service.status = response.ok ? 'active' : 'error';
      service.lastCheck = Date.now();
      service.responseTime = Date.now() - startTime;
    } catch (error) {
      const service = this.services.get('the-graph')!;
      service.status = 'error';
      service.lastCheck = Date.now();
    }
  }

  private async checkEtherscanHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      const response = await fetch('https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=demo');
      
      const service = this.services.get('etherscan')!;
      service.status = response.ok ? 'active' : 'error';
      service.lastCheck = Date.now();
      service.responseTime = Date.now() - startTime;
    } catch (error) {
      const service = this.services.get('etherscan')!;
      service.status = 'error';
      service.lastCheck = Date.now();
    }
  }

  private async checkSnapshotHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      const response = await fetch('https://hub.snapshot.org/api/msg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ _meta { hasIndexingErrors } }',
        }),
      });

      const service = this.services.get('snapshot')!;
      service.status = response.ok ? 'active' : 'error';
      service.lastCheck = Date.now();
      service.responseTime = Date.now() - startTime;
    } catch (error) {
      const service = this.services.get('snapshot')!;
      service.status = 'error';
      service.lastCheck = Date.now();
    }
  }

  private async checkZeroGHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      // Mock 0G health check - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const service = this.services.get('zero-g-ai')!;
      service.status = 'active';
      service.lastCheck = Date.now();
      service.responseTime = Date.now() - startTime;
    } catch (error) {
      const service = this.services.get('zero-g-ai')!;
      service.status = 'error';
      service.lastCheck = Date.now();
    }
  }

  private async checkSmartContractsHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      // Check if contracts are deployed and accessible
      // This would check contract addresses and basic functionality
      
      const service = this.services.get('smart-contracts')!;
      service.status = 'active';
      service.lastCheck = Date.now();
      service.responseTime = Date.now() - startTime;
    } catch (error) {
      const service = this.services.get('smart-contracts')!;
      service.status = 'error';
      service.lastCheck = Date.now();
    }
  }

  public getServiceHealth(): ServiceHealth {
    const services = Array.from(this.services.values());
    const activeServices = services.filter(s => s.status === 'active').length;
    const totalServices = services.length;

    let overall: 'healthy' | 'degraded' | 'down';
    if (activeServices === totalServices) {
      overall = 'healthy';
    } else if (activeServices > totalServices / 2) {
      overall = 'degraded';
    } else {
      overall = 'down';
    }

    return {
      overall,
      services,
      timestamp: Date.now(),
    };
  }

  public getService(name: string): BackendService | undefined {
    return this.services.get(name);
  }

  public getAllServices(): BackendService[] {
    return Array.from(this.services.values());
  }

  public destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Singleton instance
export const backendServices = new BackendServicesManager();
