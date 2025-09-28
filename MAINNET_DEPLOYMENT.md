# 🚀 Mainnet Deployment Guide

## **Prerequisites**

1. **Environment Setup**
   ```bash
   # Copy environment file
   cp env.example .env
   
   # Edit .env with your values
   nano .env
   ```

2. **Required Environment Variables**
   ```bash
   # Mainnet RPC URL (Infura/Alchemy)
   MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
   
   # Private key (with ETH for gas)
   PRIVATE_KEY=your_private_key_here
   
   # Etherscan API key for verification
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

3. **Account Requirements**
   - Wallet with at least **0.1 ETH** for gas fees
   - Private key with deployment permissions
   - Etherscan API key for contract verification

## **Deployment Steps**

### **Step 1: Compile Contracts**
```bash
npm run compile
```

### **Step 2: Deploy to Mainnet**
```bash
npm run deploy:mainnet
```

### **Step 3: Update Environment Variables**
After deployment, update your `.env` file with the deployed addresses:
```bash
NEXT_PUBLIC_REPUTATION_ORACLE_ADDRESS=0x[ORACLE_ADDRESS]
NEXT_PUBLIC_REPUTATION_PASSPORT_ADDRESS=0x[PASSPORT_ADDRESS]
NEXT_PUBLIC_SELF_PROTOCOL_VERIFIER_ADDRESS=0x[VERIFIER_ADDRESS]
NEXT_PUBLIC_REPUTATION_GATE_ADDRESS=0x[GATE_ADDRESS]
NEXT_PUBLIC_CROSS_CHAIN_REPUTATION_ADDRESS=0x[CROSS_CHAIN_ADDRESS]
```

### **Step 4: Verify Contracts**
```bash
npm run verify:mainnet
```

### **Step 5: Update Frontend**
The frontend will automatically use the new contract addresses from environment variables.

## **Deployment Output**

The deployment script will:
- ✅ Deploy all 5 contracts to mainnet
- ✅ Wait for 5 block confirmations
- ✅ Save deployment info to `deployments/mainnet.json`
- ✅ Verify contracts on Etherscan
- ✅ Provide Etherscan links for each contract

## **Contract Addresses**

After deployment, you'll get addresses like:
```
ReputationOracle: 0x1234...
ReputationPassport: 0x5678...
SelfProtocolVerifier: 0x9abc...
ReputationGate: 0xdef0...
CrossChainReputation: 0x2468...
```

## **Testing on Mainnet**

1. **Connect to Mainnet** in your wallet
2. **Visit your app** with mainnet contract addresses
3. **Test SBT minting** with a small amount first
4. **Verify transactions** on Etherscan

## **Security Considerations**

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Private Key Security**
   - Never commit private keys to git
   - Use hardware wallets for production
   - Consider using multi-sig for contract ownership

2. **Gas Optimization**
   - Contracts are optimized for gas efficiency
   - Estimated gas cost: ~0.05-0.1 ETH total

3. **Contract Verification**
   - All contracts are automatically verified on Etherscan
   - Source code is publicly available

4. **Access Control**
   - Only contract owner can update reputation scores
   - Consider transferring ownership to a DAO later

## **Post-Deployment Checklist**

- [ ] All contracts deployed successfully
- [ ] Contracts verified on Etherscan
- [ ] Environment variables updated
- [ ] Frontend using mainnet addresses
- [ ] Test SBT minting works
- [ ] Test reputation scoring works
- [ ] Test identity verification works
- [ ] Monitor gas usage and costs

## **Troubleshooting**

### **Common Issues:**

1. **Insufficient Gas**
   ```
   Error: insufficient funds for gas
   ```
   **Solution:** Add more ETH to your deployment account

2. **Contract Verification Failed**
   ```
   Error: Contract verification failed
   ```
   **Solution:** Run `npm run verify:mainnet` manually

3. **RPC Rate Limits**
   ```
   Error: Too many requests
   ```
   **Solution:** Use a premium RPC provider or wait

### **Support**

If you encounter issues:
1. Check the deployment logs
2. Verify your environment variables
3. Ensure sufficient ETH balance
4. Check network connectivity

## **Next Steps**

After successful deployment:
1. **Update your production environment**
2. **Test all functionality on mainnet**
3. **Monitor contract interactions**
4. **Set up monitoring and alerts**
5. **Consider upgrading to a DAO governance model**

---

**🎉 Congratulations! Your Ethereum Reputation Passport is now live on mainnet!**
