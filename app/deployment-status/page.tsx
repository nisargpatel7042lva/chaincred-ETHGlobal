/* Real Deployment Status Page */
"use client"

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, ExternalLink, Copy, AlertTriangle } from "lucide-react"
import { getContractAddress, getAllContractAddresses, areContractsDeployed, getEtherscanUrl } from '@/lib/contract-addresses'

interface DeploymentInfo {
  network: string;
  chainId: number;
  timestamp: number;
  deployer: string;
  contracts: {
    ReputationOracle: string;
    ReputationPassport: string;
    SelfProtocolVerifier: string;
    CrossChainReputation: string;
  };
  etherscan: {
    baseUrl: string;
    verification: boolean;
  };
}

export default function DeploymentStatusPage() {
  const { chain } = useAccount()
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeploymentStatus() {
      try {
        setLoading(true)
        
        // Try to load deployment info from file
        const response = await fetch('/deployments/sepolia.json');
        if (response.ok) {
          const data: DeploymentInfo = await response.json();
          setDeploymentStatus(data);
        } else {
          // If no deployment file, show current contract addresses
          const currentChainId = chain?.id || 11155111 // Default to Sepolia
          const contracts = getAllContractAddresses(currentChainId)
          const isDeployed = areContractsDeployed(currentChainId)
          
          setDeploymentStatus({
            network: chain?.name || 'sepolia',
            chainId: currentChainId,
            timestamp: Date.now(),
            deployer: 'Not Deployed',
            contracts,
            etherscan: {
              baseUrl: getEtherscanUrl(currentChainId),
              verification: false
            }
          })
        }
      } catch (e) {
        console.error("Failed to load deployment status:", e);
        setError("Failed to load deployment status.");
      } finally {
        setLoading(false);
      }
    }
    fetchDeploymentStatus();
  }, [chain]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const isContractDeployed = (address: string) => {
    return address !== '0x0000000000000000000000000000000000000000' && 
           address !== '0x1234567890123456789012345678901234567890'
  }

  const getContractStatus = (address: string) => {
    if (address === '0x0000000000000000000000000000000000000000') {
      return { status: 'not-deployed', label: 'Not Deployed', color: 'destructive' }
    } else if (address === '0x1234567890123456789012345678901234567890') {
      return { status: 'mock', label: 'Mock Address', color: 'secondary' }
    } else {
      return { status: 'deployed', label: 'Deployed', color: 'default' }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Contract Deployment Status
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Real-time status of deployed smart contracts
          </p>
        </header>

        {/* Current Network */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Current Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{chain?.name || 'Not Connected'}</p>
                <p className="text-sm text-muted-foreground">Chain ID: {chain?.id || 'N/A'}</p>
              </div>
              <Badge variant="secondary">
                {chain?.id ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
               error ? <XCircle className="w-5 h-5 text-red-500" /> : 
               <CheckCircle className="w-5 h-5 text-green-500" />}
              Deployment Summary
            </CardTitle>
            <CardDescription>
              Current status of smart contract deployments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading deployment status...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {deploymentStatus && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Network:</span> {deploymentStatus.network}</p>
                    <p><span className="font-medium">Chain ID:</span> {deploymentStatus.chainId}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Deployer:</span> {deploymentStatus.deployer}</p>
                    <p><span className="font-medium">Last Updated:</span> {new Date(deploymentStatus.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Contract Status:</h3>
                  {Object.entries(deploymentStatus.contracts).map(([name, address]) => {
                    const contractStatus = getContractStatus(address)
                    return (
                      <div key={name} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{name}:</span>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {address.slice(0, 6)}...{address.slice(-4)}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={contractStatus.color as any}>
                            {contractStatus.label}
                          </Badge>
                          {isContractDeployed(address) && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(address)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <a 
                                  href={`${deploymentStatus.etherscan.baseUrl}/address/${address}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Deployment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Deploy Real Contracts
            </CardTitle>
            <CardDescription>
              Deploy contracts to a real network for Etherscan verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700">
                <strong>Current Status:</strong> Contracts are using mock addresses. 
                Deploy to a real network to enable actual SBT minting and Etherscan verification.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Deployment Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Get testnet tokens:</strong> Visit the appropriate faucet for your chosen network
                </li>
                <li>
                  <strong>Set environment variables:</strong> Add your private key to <code>.env</code> file
                </li>
                <li>
                  <strong>Deploy contracts:</strong> Run <code>npx hardhat run scripts/deploy-real-contracts.js --network sepolia</code>
                </li>
                <li>
                  <strong>Update contract addresses:</strong> Update <code>lib/contract-addresses.ts</code> with deployed addresses
                </li>
                <li>
                  <strong>Verify on Etherscan:</strong> Contracts will be automatically verified
                </li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Testnet Faucets:</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Sepolia Faucet →
                    </a>
                  </li>
                  <li>
                    <a href="https://faucet.celo.org/celo-sepolia" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Celo Alfajores Faucet →
                    </a>
                  </li>
                  <li>
                    <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Polygon Mumbai Faucet →
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Environment Setup:</h4>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                  <div>PRIVATE_KEY=your_private_key</div>
                  <div>SEPOLIA_RPC_URL=your_rpc_url</div>
                  <div>ETHERSCAN_API_KEY=your_api_key</div>
                </div>
              </div>
            </div>

            <Button 
              asChild 
              className="w-full mt-4"
            >
              <a 
                href="https://docs.self.xyz/contract-integration/basic-integration" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Self Protocol Contract Integration Docs
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
