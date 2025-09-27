# Real Contract Deployment Guide

## 🚀 Deploy Contracts for Real SBT Minting

This guide will help you deploy the contracts to a real network so you can mint actual SBTs that are visible on Etherscan/Blockscan.

## 📋 Prerequisites

1. **Node.js and npm** installed
2. **Hardhat** configured
3. **Testnet tokens** for gas fees
4. **Private key** for deployment
5. **RPC URLs** for the target network

## 🔧 Step 1: Environment Setup

Create a `.env` file in your project root:

```bash
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org

# Etherscan API Keys for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
CELO_EXPLORER_API_KEY=your_celo_explorer_api_key
```

## 💰 Step 2: Get Testnet Tokens

### Sepolia (Ethereum Testnet)
- Visit: https://sepoliafaucet.com/
- Enter your wallet address
- Request ETH tokens

### Celo Alfajores (Celo Testnet)
- Visit: https://faucet.celo.org/celo-sepolia
- Connect your wallet
- Request CELO tokens

### Polygon Mumbai
- Visit: https://faucet.polygon.technology/
- Enter your wallet address
- Request MATIC tokens

## 🚀 Step 3: Deploy Contracts

### Deploy to Sepolia (Recommended for testing)

```bash
# Deploy all contracts to Sepolia
npx hardhat run scripts/deploy-real-contracts.js --network sepolia
```

### Deploy to Celo Alfajores (For Self Protocol)

```bash
# Deploy all contracts to Celo Alfajores
npx hardhat run scripts/deploy-real-contracts.js --network celoAlfajores
```

### Deploy to Mainnet (Production)

```bash
# Deploy all contracts to Mainnet
npx hardhat run scripts/deploy-real-contracts.js --network mainnet
```

## 📝 Step 4: Update Contract Addresses

After deployment, update `lib/contract-addresses.ts` with the real addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  sepolia: {
    ReputationOracle: '0x[REAL_ADDRESS]',
    ReputationPassport: '0x[REAL_ADDRESS]',
    SelfProtocolVerifier: '0x[REAL_ADDRESS]',
    CrossChainReputation: '0x[REAL_ADDRESS]',
  },
  // ... other networks
}
```

## ✅ Step 5: Verify Deployment

1. **Check deployment status**: Visit `/deployment-status` page
2. **Verify on Etherscan**: Click the contract links to see them on Etherscan
3. **Test SBT minting**: Try minting an SBT with the real contracts

## 🔍 What You'll See on Etherscan

After deployment, you can:

1. **View Contract Code**: Source code will be verified and visible
2. **See Transactions**: All SBT minting transactions will be recorded
3. **Check Token Holders**: See who has minted SBTs
4. **Read Contract State**: View reputation scores and data

## 🎯 Contract Functions

### ReputationPassport SBT Contract

- `mintReputationPassport(string explanation)` - Mint SBT to your wallet
- `hasReputationPassport(address)` - Check if address has SBT
- `getScore(address)` - Get reputation score
- `totalSupply()` - Get total SBTs minted

### SelfProtocolVerifier Contract

- `verifyAndLinkIdentity()` - Verify Self Protocol identity
- `isVerified(address)` - Check if wallet is verified
- `getVerifiedIdentity(address)` - Get verification details

## 🚨 Important Notes

1. **SBTs are Non-Transferable**: Once minted, they cannot be sold or transferred
2. **One SBT Per Wallet**: Each wallet can only mint one SBT
3. **Minimum Score Required**: Wallets need a minimum reputation score to mint
4. **Real Gas Costs**: Deploying and minting costs real gas fees

## 🔗 Useful Links

- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **Celo Alfajores Explorer**: https://alfajores.celoscan.io
- **Self Protocol Docs**: https://docs.self.xyz/
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/

## 🆘 Troubleshooting

### Deployment Fails
- Check your private key is correct
- Ensure you have enough testnet tokens
- Verify RPC URL is working

### Contract Verification Fails
- Wait a few minutes after deployment
- Check Etherscan API key is correct
- Ensure contract source code matches

### SBT Minting Fails
- Check wallet has sufficient gas
- Verify wallet meets minimum requirements
- Ensure contract is deployed and verified

## 🎉 Success!

Once deployed, you'll have:
- ✅ Real SBTs minted to user wallets
- ✅ Transactions visible on Etherscan
- ✅ Verified contract source code
- ✅ Real-time on-chain verification
- ✅ SBTs usable for voting and airdrops

Your users can now mint real Reputation Passport SBTs that are permanently recorded on the blockchain!
