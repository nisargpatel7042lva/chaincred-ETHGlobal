const { ethers, network } = require("hardhat");

async function main() {
  console.log("Deploying Self Protocol contracts on Celo...");
  console.log("Network:", network.name);

  // Deploy SelfProtocolVerifier
  console.log("Deploying SelfProtocolVerifier...");
  const SelfProtocolVerifier = await ethers.getContractFactory("SelfProtocolVerifier");
  const selfProtocolVerifier = await SelfProtocolVerifier.deploy();
  await selfProtocolVerifier.waitForDeployment();
  const verifierAddress = await selfProtocolVerifier.getAddress();
  console.log(`SelfProtocolVerifier deployed to: ${verifierAddress}`);

  // Deploy ReputationOracle
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

  // Deploy ReputationGate with Self Protocol integration
  console.log("Deploying ReputationGate with Self Protocol...");
  const ReputationGate = await ethers.getContractFactory("ReputationGate");
  const reputationGate = await ReputationGate.deploy(passportAddress, verifierAddress);
  await reputationGate.waitForDeployment();
  const gateAddress = await reputationGate.getAddress();
  console.log(`ReputationGate deployed to: ${gateAddress}`);

  // Wait for block confirmations
  console.log("Waiting for block confirmations...");
  await selfProtocolVerifier.deploymentTransaction()?.wait(3);
  await reputationOracle.deploymentTransaction()?.wait(3);
  await reputationPassport.deploymentTransaction()?.wait(3);
  await reputationGate.deploymentTransaction()?.wait(3);

  // Log deployment summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`Network: ${network.name}`);
  console.log(`SelfProtocolVerifier: ${verifierAddress}`);
  console.log(`ReputationOracle: ${oracleAddress}`);
  console.log(`ReputationPassport: ${passportAddress}`);
  console.log(`ReputationGate: ${gateAddress}`);
  console.log("========================\n");

  // Save deployment addresses to file
  const deploymentInfo = {
    network: network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      SelfProtocolVerifier: verifierAddress,
      ReputationOracle: oracleAddress,
      ReputationPassport: passportAddress,
      ReputationGate: gateAddress
    }
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '..', 'deployments', `${network.name}.json`);
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.dirname(deploymentPath);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);

  // Verify contracts if on Celo testnet
  if (network.name === "celoAlfajores") {
    console.log("Verifying contracts on Celo Explorer...");
    try {
      await hre.run("verify:verify", {
        address: verifierAddress,
        constructorArguments: [],
      });
      console.log("✅ SelfProtocolVerifier verified");
    } catch (error) {
      console.log("❌ SelfProtocolVerifier verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: oracleAddress,
        constructorArguments: [],
      });
      console.log("✅ ReputationOracle verified");
    } catch (error) {
      console.log("❌ ReputationOracle verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: passportAddress,
        constructorArguments: [oracleAddress],
      });
      console.log("✅ ReputationPassport verified");
    } catch (error) {
      console.log("❌ ReputationPassport verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: gateAddress,
        constructorArguments: [passportAddress, verifierAddress],
      });
      console.log("✅ ReputationGate verified");
    } catch (error) {
      console.log("❌ ReputationGate verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log(`🔗 View on Celo Explorer: https://alfajores.celoscan.io/address/${verifierAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
