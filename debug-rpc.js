// Debug script to check RPC URLs
console.log('=== RPC URL Debug ===');
console.log('NEXT_PUBLIC_MAINNET_RPC_URL:', process.env.NEXT_PUBLIC_MAINNET_RPC_URL);
console.log('NEXT_PUBLIC_SEPOLIA_RPC_URL:', process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
console.log('NEXT_PUBLIC_POLYGON_RPC_URL:', process.env.NEXT_PUBLIC_POLYGON_RPC_URL);
console.log('NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL:', process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL);

// Test the getRpcUrl function
const getRpcUrl = (envVar, fallback) => {
  if (!envVar || 
      envVar.includes('YOUR_') || 
      envVar.includes('localhost:3001') ||
      envVar.includes('Mainnet%20RPC%20endpoint') ||
      envVar.includes('undefined') ||
      envVar.trim() === '') {
    console.log(`Using fallback RPC URL: ${fallback}`);
    return fallback;
  }
  console.log(`Using environment RPC URL: ${envVar}`);
  return envVar;
};

console.log('\n=== Testing getRpcUrl function ===');
console.log('Mainnet:', getRpcUrl(process.env.NEXT_PUBLIC_MAINNET_RPC_URL, "https://mainnet.infura.io/v3/demo"));
console.log('Sepolia:', getRpcUrl(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL, "https://sepolia.infura.io/v3/demo"));
console.log('Polygon:', getRpcUrl(process.env.NEXT_PUBLIC_POLYGON_RPC_URL, "https://polygon-rpc.com"));
console.log('Polygon Mumbai:', getRpcUrl(process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL, "https://rpc-mumbai.maticvigil.com"));
