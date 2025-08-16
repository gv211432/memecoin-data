const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testNewServices() {
  console.log('🧪 Testing New Memecoin API Services...\n');

  // Test with a known Solana token (BONK)
  const bonkAddress = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

  try {
    console.log('1. Testing token details with new services...');
    const details = await axios.get(`${API_BASE}/memecoin/details?address=${bonkAddress}`);
    
    console.log('✅ Token details received');
    const data = details.data.data;
    
    console.log('\n📊 Token Information:');
    console.log(`- Token: ${data.tokenDetails.name} (${data.tokenDetails.symbol})`);
    console.log(`- Price: $${data.tokenDetails.price || 'N/A'}`);
    console.log(`- Market Cap: $${data.tokenDetails.marketCap?.toLocaleString() || 'N/A'}`);
    
    console.log('\n📈 Service Status:');
    const services = [
      'dexScreener', 'coinGecko', 'cryptoCompare', 'geckoTerminal', 
      'defiLlama', 'bitquery', 'birdeye', 'pumpFun', 'rugCheck'
    ];

    services.forEach(service => {
      const success = data[service]?.success;
      console.log(`- ${service}: ${success ? '✅' : '❌'}`);
    });

    // Show security info if available
    if (data.rugCheck?.success && data.rugCheck.data?.security) {
      console.log('\n🔒 Security Analysis:');
      console.log(`- Risk Score: ${data.rugCheck.data.security.score}/100`);
      console.log(`- Risk Level: ${data.rugCheck.data.security.isHighRisk ? 'HIGH' : 
                           data.rugCheck.data.security.isMediumRisk ? 'MEDIUM' : 'LOW'}`);
    }

    console.log('\n2. Testing token summary...');
    const summary = await axios.get(`${API_BASE}/memecoin/summary?address=${bonkAddress}`);
    
    console.log('✅ Token summary received');
    console.log(`- Success Rate: ${summary.data.successRate.toFixed(1)}%`);
    console.log(`- Total Sources: ${Object.keys(summary.data.sources).length}`);

  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run test
testNewServices();
