const { ethers, network } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Ethereum Reputation Passport contracts to MAINNET...");
  console.log("Network:", network.name);
  console.log("Chain ID:", network.config.chainId);

  // Verify we're on mainnet
  if (network.config.chainId !== 1) {
    throw new Error("❌ This script is for mainnet deployment only. Chain ID must be 1.");
  }

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy ReputationOracle first
  console.log("\n📊 Deploying ReputationOracle...");
  const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
  const reputationOracle = await ReputationOracle.deploy();
  await reputationOracle.waitForDeployment();
  const oracleAddress = await reputationOracle.getAddress();
  console.log(`✅ ReputationOracle deployed to: ${oracleAddress}`);

  // Deploy ReputationPassport
  console.log("\n🛡️ Deploying ReputationPassport...");
  const ReputationPassport = await ethers.getContractFactory("ReputationPassport");
  const reputationPassport = await ReputationPassport.deploy(oracleAddress);
  await reputationPassport.waitForDeployment();
  const passportAddress = await reputationPassport.getAddress();
  console.log(`✅ ReputationPassport deployed to: ${passportAddress}`);

  // Deploy SelfProtocolVerifier
  console.log("\n🔐 Deploying SelfProtocolVerifier...");
  const SelfProtocolVerifier = await ethers.getContractFactory("SelfProtocolVerifier");
  const selfProtocolVerifier = await SelfProtocolVerifier.deploy();
  await selfProtocolVerifier.waitForDeployment();
  const verifierAddress = await selfProtocolVerifier.getAddress();
  console.log(`✅ SelfProtocolVerifier deployed to: ${verifierAddress}`);

  // Deploy ReputationGate
  console.log("\n🚪 Deploying ReputationGate...");
  const ReputationGate = await ethers.getContractFactory("ReputationGate");
  const reputationGate = await ReputationGate.deploy(passportAddress, verifierAddress);
  await reputationGate.waitForDeployment();
  const gateAddress = await reputationGate.getAddress();
  console.log(`✅ ReputationGate deployed to: ${gateAddress}`);

  // Deploy CrossChainReputation
  console.log("\n🌐 Deploying CrossChainReputation...");
  const CrossChainReputation = await ethers.getContractFactory("CrossChainReputation");
  const crossChainReputation = await CrossChainReputation.deploy(oracleAddress);
  await crossChainReputation.waitForDeployment();
  const crossChainAddress = await crossChainReputation.getAddress();
  console.log(`✅ CrossChainReputation deployed to: ${crossChainAddress}`);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await reputationOracle.deploymentTransaction()?.wait(5);
  await reputationPassport.deploymentTransaction()?.wait(5);
  await selfProtocolVerifier.deploymentTransaction()?.wait(5);
  await reputationGate.deploymentTransaction()?.wait(5);
  await crossChainReputation.deploymentTransaction()?.wait(5);

  // Log deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 MAINNET DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log(`Network: ${network.name} (Chain ID: ${network.config.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Gas Used: ${await getTotalGasUsed()}`);
  console.log("\n📋 Contract Addresses:");
  console.log(`ReputationOracle: ${oracleAddress}`);
  console.log(`ReputationPassport: ${passportAddress}`);
  console.log(`SelfProtocolVerifier: ${verifierAddress}`);
  console.log(`ReputationGate: ${gateAddress}`);
  console.log(`CrossChainReputation: ${crossChainAddress}`);
  console.log("=".repeat(60));

  // Save deployment addresses to file
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ReputationOracle: oracleAddress,
      ReputationPassport: passportAddress,
      SelfProtocolVerifier: verifierAddress,
      ReputationGate: gateAddress,
      CrossChainReputation: crossChainAddress
    },
    etherscan: {
      baseUrl: "https://etherscan.io",
      contracts: {
        ReputationOracle: `https://etherscan.io/address/${oracleAddress}`,
        ReputationPassport: `https://etherscan.io/address/${passportAddress}`,
        SelfProtocolVerifier: `https://etherscan.io/address/${verifierAddress}`,
        ReputationGate: `https://etherscan.io/address/${gateAddress}`,
        CrossChainReputation: `https://etherscan.io/address/${crossChainAddress}`
      }
    }
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'mainnet.json');
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.dirname(deploymentPath);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  // Verify contracts on Etherscan
  console.log("\n🔍 Verifying contracts on Etherscan...");
  await verifyContract("ReputationOracle", oracleAddress, []);
  await verifyContract("ReputationPassport", passportAddress, [oracleAddress]);
  await verifyContract("SelfProtocolVerifier", verifierAddress, []);
  await verifyContract("ReputationGate", gateAddress, [passportAddress, verifierAddress]);
  await verifyContract("CrossChainReputation", crossChainAddress, [oracleAddress]);

  console.log("\n🎯 Next Steps:");
  console.log("1. Update your .env file with the contract addresses");
  console.log("2. Update lib/contract-addresses.ts with the new addresses");
  console.log("3. Test the contracts on mainnet");
  console.log("4. Update your frontend to use the new addresses");
  console.log("\n🔗 View contracts on Etherscan:");
  console.log(`ReputationPassport: https://etherscan.io/address/${passportAddress}`);
  console.log(`ReputationOracle: https://etherscan.io/address/${oracleAddress}`);
}

async function getTotalGasUsed() {
  // This would calculate total gas used across all deployments
  // For now, return a placeholder
  return "Calculating...";
}

async function verifyContract(contractName, address, constructorArgs) {
  try {
    console.log(`Verifying ${contractName}...`);
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });
    console.log(`✅ ${contractName} verified successfully`);
  } catch (error) {
    console.log(`❌ ${contractName} verification failed:`, error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Mainnet deployment failed:", error);
    process.exit(1);
  });
