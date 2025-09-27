const { ethers, network } = require("hardhat");

async function main() {
  console.log("Populating ReputationOracle with test data...");

  // Get the deployed oracle contract
  const oracleAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // From deployment
  if (!oracleAddress) {
    console.error("Oracle address not found");
    process.exit(1);
  }

  const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
  const oracle = ReputationOracle.attach(oracleAddress);

  // Test wallet addresses (valid checksum addresses)
  const testWallets = [
    "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Example address 1
    "0x8ba1f109551bD432803012645Hac136c", // Example address 2
    "0x1234567890123456789012345678901234567890", // Example address 3
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat account 0
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat account 1
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat account 2
  ];

  // Test reputation data
  const testData = [
    {
      score: 85,
      walletAge: 365, // 1 year
      daoVotes: 15,
      defiTxs: 45,
      totalTxs: 200,
      uniqueContracts: 25,
      lastActivity: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    },
    {
      score: 72,
      walletAge: 180, // 6 months
      daoVotes: 8,
      defiTxs: 30,
      totalTxs: 150,
      uniqueContracts: 18,
      lastActivity: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
    },
    {
      score: 95,
      walletAge: 730, // 2 years
      daoVotes: 25,
      defiTxs: 80,
      totalTxs: 500,
      uniqueContracts: 40,
      lastActivity: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    },
    {
      score: 78,
      walletAge: 200, // 200 days
      daoVotes: 12,
      defiTxs: 35,
      totalTxs: 180,
      uniqueContracts: 22,
      lastActivity: Math.floor(Date.now() / 1000) - 43200, // 12 hours ago
    },
    {
      score: 88,
      walletAge: 400, // 400 days
      daoVotes: 18,
      defiTxs: 55,
      totalTxs: 300,
      uniqueContracts: 30,
      lastActivity: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    },
    {
      score: 92,
      walletAge: 600, // 600 days
      daoVotes: 22,
      defiTxs: 70,
      totalTxs: 400,
      uniqueContracts: 35,
      lastActivity: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
    },
  ];

  console.log(`Network: ${network.name}`);
  console.log(`Oracle Address: ${oracleAddress}`);

  // Populate oracle with test data
  for (let i = 0; i < testWallets.length; i++) {
    const wallet = testWallets[i];
    const data = testData[i];

    try {
      console.log(`\nUpdating reputation for ${wallet}...`);
      console.log(`Score: ${data.score}, Age: ${data.walletAge} days, DAO Votes: ${data.daoVotes}`);

      const tx = await oracle.updateReputationScore(
        wallet,
        data.score,
        data.walletAge,
        data.daoVotes,
        data.defiTxs,
        data.totalTxs,
        data.uniqueContracts,
        data.lastActivity
      );

      await tx.wait();
      console.log(`✅ Successfully updated reputation for ${wallet}`);
    } catch (error) {
      console.error(`❌ Failed to update reputation for ${wallet}:`, error.message);
    }
  }

  // Verify the data was stored correctly
  console.log("\n=== Verifying stored data ===");
  for (let i = 0; i < testWallets.length; i++) {
    const wallet = testWallets[i];
    try {
      const reputationData = await oracle.getReputationData(wallet);
      const isEligible = await oracle.isEligibleForSBT(wallet);
      
      console.log(`\nWallet: ${wallet}`);
      console.log(`Score: ${reputationData.score}`);
      console.log(`Eligible for SBT: ${isEligible}`);
      console.log(`Valid: ${reputationData.isValid}`);
    } catch (error) {
      console.error(`Failed to verify data for ${wallet}:`, error.message);
    }
  }

  console.log("\n=== Oracle Population Complete ===");
  console.log("Test data has been populated. You can now test SBT minting!");
  console.log("\n=== Contract Addresses ===");
  console.log(`ReputationOracle: ${oracleAddress}`);
  console.log(`ReputationPassport: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`);
  console.log(`ReputationGate: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`);
  console.log(`CrossChainReputation: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
