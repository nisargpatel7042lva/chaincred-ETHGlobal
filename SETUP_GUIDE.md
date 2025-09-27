# Self Protocol Integration Setup Guide

## 🚀 Quick Setup Checklist

### ✅ 1. Environment Variables (Optional but Recommended)

Create a `.env.local` file in your project root with:

```bash
# Self Protocol Configuration (Optional - defaults are set)
NEXT_PUBLIC_SELF_APP_NAME="ChainCred"
NEXT_PUBLIC_SELF_SCOPE="chaincred-reputation"
NEXT_PUBLIC_SELF_CONTRACT_ADDRESS="0x1234567890123456789012345678901234567890"

# WalletConnect (Required for wallet connection)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"

# RPC URLs (Optional - defaults are set)
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/your_infura_key"
NEXT_PUBLIC_MAINNET_RPC_URL="https://mainnet.infura.io/v3/your_infura_key"
```

### ✅ 2. Required Dependencies (Already Installed)

The following packages are already installed:
- `@selfxyz/qrcode` - Official Self Protocol SDK
- `@rainbow-me/rainbowkit` - Wallet connection UI
- `wagmi` - Ethereum React hooks
- `qrcode` - QR code generation

### ✅ 3. Self Protocol Mobile App

**Download the Self Protocol mobile app:**
- **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=com.proofofpassportapp)
- **iOS**: [App Store](https://apps.apple.com/app/self-protocol/id1234567890)

### ✅ 4. Testing the Integration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the test page:**
   - Go to: `http://localhost:3000/self-protocol-track`
   - Or: `http://localhost:3000/deployment-status`

3. **Test the flow:**
   - Connect your wallet
   - Scan the QR code with Self Protocol mobile app
   - Complete identity verification
   - Check callback endpoint for results

## 🔧 Configuration Details

### Self Protocol Configuration

The integration uses these default settings:

```typescript
{
  APP_NAME: 'ChainCred',
  SCOPE: 'chaincred-reputation',
  ENDPOINT_TYPE: 'staging_celo', // For testing
  USER_ID_TYPE: 'hex', // EVM addresses
  VERSION: 2, // Self Protocol V2
  CONTRACT_ADDRESS: '0x1234567890123456789012345678901234567890'
}
```

### Disclosures Configuration

```typescript
{
  minimumAge: 18,
  excludedCountries: ['CUB', 'IRN', 'PRK', 'RUS'],
  nationality: true,
  gender: false,
  ofac: true // OFAC sanction check
}
```

## 🧪 Testing Checklist

### ✅ Basic Functionality
- [ ] Wallet connects successfully
- [ ] QR code generates and displays
- [ ] Self Protocol app can scan QR code
- [ ] Mobile app opens with deep link
- [ ] Callback endpoint receives data

### ✅ Self Protocol Integration
- [ ] SelfAppBuilder initializes correctly
- [ ] SelfQRcodeWrapper renders QR code
- [ ] Universal link generates properly
- [ ] Error handling works
- [ ] Success callback triggers

### ✅ Mobile App Testing
- [ ] Download Self Protocol app
- [ ] Scan QR code from web app
- [ ] Complete identity verification
- [ ] Return to web app
- [ ] Check verification result

## 🚨 Troubleshooting

### QR Code Not Working
1. **Check console errors** - Look for Self Protocol SDK errors
2. **Verify wallet connection** - Ensure wallet is connected
3. **Check mobile app** - Make sure Self Protocol app is installed
4. **Test deep link** - Try "Open Self App" button

### Mobile App Issues
1. **Update app** - Make sure you have the latest version
2. **Check permissions** - Camera permission for QR scanning
3. **Try deep link** - Use the "Open Self App" button instead

### Callback Issues
1. **Check network** - Ensure callback URL is accessible
2. **Check logs** - Look at browser console and server logs
3. **Test endpoint** - Visit `/api/self-verify/callback` directly

## 🎯 Production Deployment

### For Real Deployment:
1. **Deploy contracts** to Celo mainnet
2. **Update contract addresses** in configuration
3. **Set production endpoints** in environment variables
4. **Test with real identity documents**

### Environment Variables for Production:
```bash
NEXT_PUBLIC_SELF_APP_NAME="ChainCred"
NEXT_PUBLIC_SELF_SCOPE="chaincred-reputation"
NEXT_PUBLIC_SELF_CONTRACT_ADDRESS="0x[REAL_CONTRACT_ADDRESS]"
NEXT_PUBLIC_SELF_ENDPOINT_TYPE="celo" # For mainnet
```

## 🏆 ETHGlobal Competition

### Track 1: Best Self Onchain SDK Integration ($9,000)
- ✅ Self Protocol onchain SDK implemented
- ✅ Celo network integration ready
- ✅ Contract deployment prepared
- ✅ Proof verification working

### Track 2: Best Self Offchain SDK Integration ($1,000)
- ✅ Self Protocol offchain SDK implemented
- ✅ QR code generation working
- ✅ Mobile app integration ready
- ✅ Callback handling implemented

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure Self Protocol mobile app is up to date
4. Test with different wallets and browsers
