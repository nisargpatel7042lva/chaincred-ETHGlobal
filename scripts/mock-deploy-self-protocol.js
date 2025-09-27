const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Creating mock deployment for Self Protocol contracts...");
  
  // Mock contract addresses (these would be real addresses after deployment)
  const deploymentInfo = {
    network: "celoAlfajores",
    timestamp: new Date().toISOString(),
    contracts: {
      SelfProtocolVerifier: "0x1234567890123456789012345678901234567890",
      ReputationOracle: "0x0987654321098765432109876543210987654321",
      ReputationPassport: "0x1111111111111111111111111111111111111111",
      ReputationGate: "0x2222222222222222222222222222222222222222"
    },
    note: "Mock deployment - replace with real addresses after actual deployment"
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentPath = path.join(deploymentsDir, 'celoAlfajores.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("Mock deployment info saved to:", deploymentPath);
  console.log("\n=== MOCK DEPLOYMENT SUMMARY ===");
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`SelfProtocolVerifier: ${deploymentInfo.contracts.SelfProtocolVerifier}`);
  console.log(`ReputationOracle: ${deploymentInfo.contracts.ReputationOracle}`);
  console.log(`ReputationPassport: ${deploymentInfo.contracts.ReputationPassport}`);
  console.log(`ReputationGate: ${deploymentInfo.contracts.ReputationGate}`);
  console.log("========================\n");
  
  console.log("📝 To deploy real contracts:");
  console.log("1. Get CELO testnet tokens from: https://faucet.celo.org/celo-sepolia");
  console.log("2. Set PRIVATE_KEY in .env file");
  console.log("3. Run: npx hardhat run scripts/deploy-self-protocol.js --network celoAlfajores");
  console.log("4. Update the contract addresses in lib/self-protocol.ts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Mock deployment failed:", error);
    process.exit(1);
  });
