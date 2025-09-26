const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...");

  try {
    // Deploy ReputationOracle first
    console.log("📝 Deploying ReputationOracle...");
    const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
    const reputationOracle = await ReputationOracle.deploy();
    await reputationOracle.waitForDeployment();
    const oracleAddress = await reputationOracle.getAddress();
    console.log(`✅ ReputationOracle: ${oracleAddress}`);

    // Deploy ReputationPassport
    console.log("📝 Deploying ReputationPassport...");
    const ReputationPassport = await ethers.getContractFactory("ReputationPassport");
    const reputationPassport = await ReputationPassport.deploy(oracleAddress);
    await reputationPassport.waitForDeployment();
    const passportAddress = await reputationPassport.getAddress();
    console.log(`✅ ReputationPassport: ${passportAddress}`);

    // Deploy ReputationGate
    console.log("📝 Deploying ReputationGate...");
    const ReputationGate = await ethers.getContractFactory("ReputationGate");
    const reputationGate = await ReputationGate.deploy(passportAddress);
    await reputationGate.waitForDeployment();
    const gateAddress = await reputationGate.getAddress();
    console.log(`✅ ReputationGate: ${gateAddress}`);

    // Deploy CrossChainReputation
    console.log("📝 Deploying CrossChainReputation...");
    const CrossChainReputation = await ethers.getContractFactory("CrossChainReputation");
    const crossChainReputation = await CrossChainReputation.deploy(oracleAddress);
    await crossChainReputation.waitForDeployment();
    const crossChainAddress = await crossChainReputation.getAddress();
    console.log(`✅ CrossChainReputation: ${crossChainAddress}`);

    console.log("\n🎉 All contracts deployed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log(`ReputationOracle: ${oracleAddress}`);
    console.log(`ReputationPassport: ${passportAddress}`);
    console.log(`ReputationGate: ${gateAddress}`);
    console.log(`CrossChainReputation: ${crossChainAddress}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
