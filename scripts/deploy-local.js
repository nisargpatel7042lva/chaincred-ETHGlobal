const { ethers, network } = require("hardhat");

async function main() {
  console.log("Deploying Reputation Passport contracts to local network...");
  console.log("Network:", network.name);
  console.log("Chain ID:", network.config.chainId);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying contracts with account:", deployerAddress);
  console.log("Account balance:", (await deployer.provider.getBalance(deployerAddress)).toString());

  try {
    // Deploy ReputationOracle first
    console.log("\n1. Deploying ReputationOracle...");
    const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
    const reputationOracle = await ReputationOracle.deploy();
    await reputationOracle.waitForDeployment();
    const oracleAddress = await reputationOracle.getAddress();
    console.log(`✅ ReputationOracle deployed to: ${oracleAddress}`);

    // Deploy ReputationPassport
    console.log("\n2. Deploying ReputationPassport...");
    const ReputationPassport = await ethers.getContractFactory("ReputationPassport");
    const reputationPassport = await ReputationPassport.deploy(oracleAddress);
    await reputationPassport.waitForDeployment();
    const passportAddress = await reputationPassport.getAddress();
    console.log(`✅ ReputationPassport deployed to: ${passportAddress}`);

    // Deploy ReputationGate
    console.log("\n3. Deploying ReputationGate...");
    const ReputationGate = await ethers.getContractFactory("ReputationGate");
    const reputationGate = await ReputationGate.deploy(passportAddress);
    await reputationGate.waitForDeployment();
    const gateAddress = await reputationGate.getAddress();
    console.log(`✅ ReputationGate deployed to: ${gateAddress}`);

    // Deploy CrossChainReputation
    console.log("\n4. Deploying CrossChainReputation...");
    const CrossChainReputation = await ethers.getContractFactory("CrossChainReputation");
    const crossChainReputation = await CrossChainReputation.deploy(oracleAddress);
    await crossChainReputation.waitForDeployment();
    const crossChainAddress = await crossChainReputation.getAddress();
    console.log(`✅ CrossChainReputation deployed to: ${crossChainAddress}`);

    console.log("\n=== 🎉 Deployment Summary ===");
    console.log(`Network: ${network.name}`);
    console.log(`Chain ID: ${network.config.chainId}`);
    console.log(`Deployer: ${deployerAddress}`);
    console.log(`\nContract Addresses:`);
    console.log(`ReputationOracle: ${oracleAddress}`);
    console.log(`ReputationPassport: ${passportAddress}`);
    console.log(`ReputationGate: ${gateAddress}`);
    console.log(`CrossChainReputation: ${crossChainAddress}`);
    
    console.log("\n=== 📝 Next Steps ===");
    console.log("1. Copy these addresses to your .env file");
    console.log("2. Update your frontend with the contract addresses");
    console.log("3. Test the contracts with sample data");
    console.log("4. Deploy to Sepolia testnet when ready");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
