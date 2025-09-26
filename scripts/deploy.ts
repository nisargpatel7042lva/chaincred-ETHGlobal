import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Reputation Passport contracts...");

  // Deploy ReputationOracle first
  console.log("Deploying ReputationOracle...");
  const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
  const reputationOracle = await ReputationOracle.deploy();
  await reputationOracle.waitForDeployment();
  const oracleAddress = await reputationOracle.getAddress();
  console.log(`ReputationOracle deployed to: ${oracleAddress}`);

  // Deploy ReputationPassport
  console.log("Deploying ReputationPassport...");
  const ReputationPassport = await ethers.getContractFactory("ReputationPassport");
  const reputationPassport = await ReputationPassport.deploy(oracleAddress);
  await reputationPassport.waitForDeployment();
  const passportAddress = await reputationPassport.getAddress();
  console.log(`ReputationPassport deployed to: ${passportAddress}`);

  // Deploy ReputationGate
  console.log("Deploying ReputationGate...");
  const ReputationGate = await ethers.getContractFactory("ReputationGate");
  const reputationGate = await ReputationGate.deploy(passportAddress);
  await reputationGate.waitForDeployment();
  const gateAddress = await reputationGate.getAddress();
  console.log(`ReputationGate deployed to: ${gateAddress}`);

  // Deploy CrossChainReputation
  console.log("Deploying CrossChainReputation...");
  const CrossChainReputation = await ethers.getContractFactory("CrossChainReputation");
  const crossChainReputation = await CrossChainReputation.deploy(oracleAddress);
  await crossChainReputation.waitForDeployment();
  const crossChainAddress = await crossChainReputation.getAddress();
  console.log(`CrossChainReputation deployed to: ${crossChainAddress}`);

  // Verify contracts on Etherscan if on Sepolia
  if (network.name === "sepolia") {
    console.log("Waiting for block confirmations...");
    await reputationOracle.deploymentTransaction()?.wait(6);
    await reputationPassport.deploymentTransaction()?.wait(6);
    await reputationGate.deploymentTransaction()?.wait(6);
    await crossChainReputation.deploymentTransaction()?.wait(6);
    
    console.log("Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: oracleAddress,
        constructorArguments: [],
      });
      console.log("ReputationOracle verified on Etherscan!");
    } catch (error) {
      console.log("ReputationOracle verification failed:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: passportAddress,
        constructorArguments: [oracleAddress],
      });
      console.log("ReputationPassport verified on Etherscan!");
    } catch (error) {
      console.log("ReputationPassport verification failed:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: gateAddress,
        constructorArguments: [passportAddress],
      });
      console.log("ReputationGate verified on Etherscan!");
    } catch (error) {
      console.log("ReputationGate verification failed:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: crossChainAddress,
        constructorArguments: [oracleAddress],
      });
      console.log("CrossChainReputation verified on Etherscan!");
    } catch (error) {
      console.log("CrossChainReputation verification failed:", error);
    }
  }

  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.config.chainId}`);
  console.log(`ReputationOracle: ${oracleAddress}`);
  console.log(`ReputationPassport: ${passportAddress}`);
  console.log(`ReputationGate: ${gateAddress}`);
  console.log(`CrossChainReputation: ${crossChainAddress}`);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Update your .env file with the contract addresses");
  console.log("2. Update your frontend with the contract addresses");
  console.log("3. Test the contracts with sample data");
  console.log("4. Deploy to other networks (Kadena, etc.)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
