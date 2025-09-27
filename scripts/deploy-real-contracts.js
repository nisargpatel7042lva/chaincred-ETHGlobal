const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying Real Contracts to", network.name);
  console.log("=====================================");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy ReputationOracle first
  console.log("\n📊 Deploying ReputationOracle...");
  const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
  const reputationOracle = await ReputationOracle.deploy();
  await reputationOracle.waitForDeployment();
  const oracleAddress = await reputationOracle.getAddress();
  console.log("✅ ReputationOracle deployed to:", oracleAddress);

  // Deploy ReputationPassport SBT
  console.log("\n🏆 Deploying ReputationPassport SBT...");
  const ReputationPassport = await ethers.getContractFactory("ReputationPassport");
  const reputationPassport = await ReputationPassport.deploy(oracleAddress);
  await reputationPassport.waitForDeployment();
  const passportAddress = await reputationPassport.getAddress();
  console.log("✅ ReputationPassport deployed to:", passportAddress);

  // Deploy SelfProtocolVerifier
  console.log("\n🔐 Deploying SelfProtocolVerifier...");
  const SelfProtocolVerifier = await ethers.getContractFactory("SelfProtocolVerifier");
  const selfProtocolVerifier = await SelfProtocolVerifier.deploy();
  await selfProtocolVerifier.waitForDeployment();
  const verifierAddress = await selfProtocolVerifier.getAddress();
  console.log("✅ SelfProtocolVerifier deployed to:", verifierAddress);

  // Deploy CrossChainReputation
  console.log("\n🌉 Deploying CrossChainReputation...");
  const CrossChainReputation = await ethers.getContractFactory("CrossChainReputation");
  const crossChainReputation = await CrossChainReputation.deploy();
  await crossChainReputation.waitForDeployment();
  const crossChainAddress = await crossChainReputation.getAddress();
  console.log("✅ CrossChainReputation deployed to:", crossChainAddress);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    timestamp: Date.now(),
    deployer: deployer.address,
    contracts: {
      ReputationOracle: oracleAddress,
      ReputationPassport: passportAddress,
      SelfProtocolVerifier: verifierAddress,
      CrossChainReputation: crossChainAddress
    },
    etherscan: {
      baseUrl: getEtherscanBaseUrl(network.name),
      verification: true
    }
  };

  // Create deployments directory
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info
  const filePath = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${filePath}`);

  // Verify contracts on Etherscan (if not localhost)
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("\n🔍 Verifying contracts on Etherscan...");
    
    try {
      // Wait for block confirmations
      console.log("⏳ Waiting for block confirmations...");
      await reputationOracle.deploymentTransaction()?.wait(6);
      await reputationPassport.deploymentTransaction()?.wait(6);
      await selfProtocolVerifier.deploymentTransaction()?.wait(6);
      await crossChainReputation.deploymentTransaction()?.wait(6);

      // Verify ReputationOracle
      console.log("🔍 Verifying ReputationOracle...");
      await hre.run("verify:verify", {
        address: oracleAddress,
        constructorArguments: [],
      });
      console.log("✅ ReputationOracle verified!");

      // Verify ReputationPassport
      console.log("🔍 Verifying ReputationPassport...");
      await hre.run("verify:verify", {
        address: passportAddress,
        constructorArguments: [oracleAddress],
      });
      console.log("✅ ReputationPassport verified!");

      // Verify SelfProtocolVerifier
      console.log("🔍 Verifying SelfProtocolVerifier...");
      await hre.run("verify:verify", {
        address: verifierAddress,
        constructorArguments: [],
      });
      console.log("✅ SelfProtocolVerifier verified!");

      // Verify CrossChainReputation
      console.log("🔍 Verifying CrossChainReputation...");
      await hre.run("verify:verify", {
        address: crossChainAddress,
        constructorArguments: [],
      });
      console.log("✅ CrossChainReputation verified!");

    } catch (error) {
      console.error("❌ Error verifying contracts:", error.message);
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(50));
  console.log(`Network: ${network.name} (Chain ID: ${network.config.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("\n📋 Contract Addresses:");
  console.log(`ReputationOracle: ${oracleAddress}`);
  console.log(`ReputationPassport: ${passportAddress}`);
  console.log(`SelfProtocolVerifier: ${verifierAddress}`);
  console.log(`CrossChainReputation: ${crossChainAddress}`);
  
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log(`\n🔗 View on Etherscan:`);
    console.log(`ReputationOracle: ${getEtherscanBaseUrl(network.name)}/address/${oracleAddress}`);
    console.log(`ReputationPassport: ${getEtherscanBaseUrl(network.name)}/address/${passportAddress}`);
    console.log(`SelfProtocolVerifier: ${getEtherscanBaseUrl(network.name)}/address/${verifierAddress}`);
    console.log(`CrossChainReputation: ${getEtherscanBaseUrl(network.name)}/address/${crossChainAddress}`);
  }

  console.log("\n🚀 Next Steps:");
  console.log("1. Update your frontend with the new contract addresses");
  console.log("2. Test SBT minting with real contracts");
  console.log("3. Verify contracts are working on Etherscan");
  console.log("=".repeat(50));
}

function getEtherscanBaseUrl(networkName) {
  switch (networkName) {
    case 'sepolia':
      return 'https://sepolia.etherscan.io';
    case 'mainnet':
      return 'https://etherscan.io';
    case 'polygon':
      return 'https://polygonscan.com';
    case 'polygonMumbai':
      return 'https://mumbai.polygonscan.com';
    case 'bsc':
      return 'https://bscscan.com';
    case 'bscTestnet':
      return 'https://testnet.bscscan.com';
    case 'celo':
      return 'https://celoscan.io';
    case 'celoAlfajores':
      return 'https://alfajores.celoscan.io';
    default:
      return 'https://etherscan.io';
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
