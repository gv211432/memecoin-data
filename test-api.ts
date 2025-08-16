const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

const SERVICES = [
  'dexScreener', 'coinGecko', 'cryptoCompare', 'geckoTerminal',
  'defiLlama', 'bitquery', 'birdeye', 'pumpFun', 'rugCheck'
];

async function testAPI() {
  console.log('🧪 Testing Solana Memecoin API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_BASE}/memecoin/health`);
    console.log('✅ Health check:', health.data);

    // Test with a known Solana token (USDC)
    const usdcAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

    console.log('\n2. Testing token summary...');
    const summary = await axios.get(`${API_BASE}/memecoin/summary?address=${usdcAddress}`);
    console.log('✅ Token summary received');
    console.log(JSON.stringify(summary.data, null, 2));

    console.log('\n3. Testing token details...');
    const details = await axios.get(`${API_BASE}/memecoin/details?address=${usdcAddress}`);
    console.log('✅ Token details received');
    console.log(JSON.stringify(details.data, null, 2));

    console.log('\n📊 Test Results:');
    console.log(`- Token: ${details.data.data.tokenDetails.name} (${details.data.data.tokenDetails.symbol})`);
    console.log(`- Price: $${details.data.data.tokenDetails.price || 'N/A'}`);
    console.log(`- Market Cap: $${details.data.data.tokenDetails.marketCap?.toLocaleString() || 'N/A'}`);

    SERVICES.forEach(service => {
      const success = details.data.data[service]?.success;
      console.log(`- ${service}: ${success ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run test when server is ready
setTimeout(() => {
  testAPI();
}, 5000);
