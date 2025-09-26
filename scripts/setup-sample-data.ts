import { ethers } from "hardhat";

async function main() {
  console.log("Setting up sample reputation data...");

  // Get the deployed contracts
  const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
  const ReputationPassport = await ethers.getContractFactory("ReputationPassport");
  
  // You'll need to replace these with your actual deployed addresses
  const oracleAddress = process.env.REPUTATION_ORACLE_ADDRESS || "0x...";
  const passportAddress = process.env.REPUTATION_PASSPORT_ADDRESS || "0x...";
  
  const reputationOracle = ReputationOracle.attach(oracleAddress);
  const reputationPassport = ReputationPassport.attach(passportAddress);

  // Sample wallet addresses (replace with real addresses for testing)
  const sampleWallets = [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012",
    "0x4567890123456789012345678901234567890123",
    "0x5678901234567890123456789012345678901234"
  ];

  // Sample reputation data
  const sampleData = [
    { score: 85, walletAge: 365, daoVotes: 15, defiTxs: 50, totalTxs: 200, uniqueContracts: 25, lastActivity: Math.floor(Date.now() / 1000) - 86400 },
    { score: 72, walletAge: 180, daoVotes: 8, defiTxs: 30, totalTxs: 150, uniqueContracts: 15, lastActivity: Math.floor(Date.now() / 1000) - 172800 },
    { score: 95, walletAge: 730, daoVotes: 25, defiTxs: 100, totalTxs: 500, uniqueContracts: 40, lastActivity: Math.floor(Date.now() / 1000) - 3600 },
    { score: 68, walletAge: 90, daoVotes: 3, defiTxs: 20, totalTxs: 80, uniqueContracts: 10, lastActivity: Math.floor(Date.now() / 1000) - 259200 },
    { score: 88, walletAge: 450, daoVotes: 18, defiTxs: 75, totalTxs: 300, uniqueContracts: 30, lastActivity: Math.floor(Date.now() / 1000) - 43200 }
  ];

  console.log("Adding sample reputation data to oracle...");
  
  for (let i = 0; i < sampleWallets.length; i++) {
    const wallet = sampleWallets[i];
    const data = sampleData[i];
    
    try {
      const tx = await reputationOracle.updateReputationScore(
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
      console.log(`Added reputation data for ${wallet} (score: ${data.score})`);
    } catch (error) {
      console.error(`Failed to add reputation data for ${wallet}:`, error);
    }
  }

  console.log("Minting sample reputation passports...");
  
  for (let i = 0; i < sampleWallets.length; i++) {
    const wallet = sampleWallets[i];
    const data = sampleData[i];
    
    // Only mint for wallets with score >= 70
    if (data.score >= 70) {
      try {
        const explanation = `This wallet has a strong reputation with ${data.walletAge} days of activity, ${data.daoVotes} DAO votes, and ${data.defiTxs} DeFi transactions.`;
        
        const tx = await reputationPassport.mintReputationPassport(wallet, explanation);
        await tx.wait();
        console.log(`Minted reputation passport for ${wallet}`);
      } catch (error) {
        console.error(`Failed to mint passport for ${wallet}:`, error);
      }
    } else {
      console.log(`Skipping ${wallet} - score too low (${data.score})`);
    }
  }

  console.log("Sample data setup completed!");
  console.log("\n=== Sample Wallets ===");
  for (let i = 0; i < sampleWallets.length; i++) {
    const wallet = sampleWallets[i];
    const data = sampleData[i];
    console.log(`${wallet}: Score ${data.score}, Age ${data.walletAge} days, DAO votes ${data.daoVotes}, DeFi txs ${data.defiTxs}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
