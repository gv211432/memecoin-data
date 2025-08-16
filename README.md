# Solana Memecoin Free Data API

A comprehensive REST API for fetching Solana memecoin details from multiple data sources including DexScreener, CoinGecko, CryptoCompare, GeckoTerminal, DeFi Llama, and Bitquery, etc.

## Features

- **Multi-source data aggregation** from 6+ different APIs
- **Graceful error handling** - if one API fails, others continue to work
- **Real-time and historical data** for price, volume, market cap
- **RESTful API** with proper validation and error responses
- **Extensible architecture** for adding new data sources
- **TypeScript support** with proper DTOs and interfaces
- **Environment configuration** for API keys

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run start:dev
```

### Environment Setup

Create a `.env` file with your API keys (optional):

```bash
# Server Configuration
PORT=3000

# API Keys (optional - services work without them but may have rate limits)
COINGECKO_API_KEY=your_coingecko_api_key_here
CRYPTOCOMPARE_API_KEY=your_cryptocompare_api_key_here
BITQUERY_API_KEY=your_bitquery_api_key_here
```

## API Endpoints

### Get Token Details
```http
GET /api/memecoin/details?address={token_address}
POST /api/memecoin/details
Content-Type: application/json

{
  "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
}
```

### Get Token Summary
```http
GET /api/memecoin/summary?address={token_address}
```

### Health Check
```http
GET /api/memecoin/health
```

## Example Response

```json
{
  "success": true,
  "data": {
    "tokenDetails": {
      "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "USD Coin",
      "symbol": "USDC",
      "decimals": 6,
      "price": 1.0,
      "marketCap": 25000000000,
      "volume24h": 5000000000,
      "priceChange24h": 0.01,
      "image": "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png"
    },
    "dexScreener": {
      "success": true,
      "data": {
        "price": 1.0,
        "priceChange24h": 0.01,
        "volume24h": 5000000000,
        "marketCap": 25000000000
      },
      "timestamp": "2024-08-15T13:27:28.000Z"
    },
    "coinGecko": {
      "success": true,
      "data": { ... },
      "timestamp": "2024-08-15T13:27:28.000Z"
    },
    "cryptoCompare": {
      "success": false,
      "data": null,
      "error": "Token not found on CryptoCompare",
      "timestamp": "2024-08-15T13:27:28.000Z"
    },
    "geckoTerminal": {
      "success": true,
      "data": { ... },
      "timestamp": "2024-08-15T13:27:28.000Z"
    },
    "defiLlama": {
      "success": true,
      "data": { ... },
      "timestamp": "2024-08-15T13:27:28.000Z"
    },
    "bitquery": {
      "success": true,
      "data": { ... },
      "timestamp": "2024-08-15T13:27:28.000Z"
    },
    "priceHistory": {
      "success": true,
      "data": [...],
      "timestamp": "2024-08-15T13:27:28.000Z"
    }
  },
  "timestamp": "2024-08-15T13:27:28.000Z"
}
```

## Supported Data Sources

| Source | Endpoint | Free Tier | Notes |
|--------|----------|-----------|--------|
| **DexScreener** | dexscreener.com | ✅ Free | Real-time DEX data |
| **CoinGecko** | coingecko.com | ✅ Free | Market data & metadata |
| **CryptoCompare** | cryptocompare.com | ✅ Free | Price & volume data |
| **GeckoTerminal** | geckoterminal.com | ✅ Free | DEX analytics |
| **DeFi Llama** | defillama.com | ✅ Free | DeFi & token data |
| **Bitquery** | bitquery.io | ✅ Free | On-chain analytics |

## Development

### Project Structure
```
src/
├── controllers/          # REST API endpoints
├── services/            # Business logic & API integrations
├── dto/                 # Data Transfer Objects
├── types/               # TypeScript interfaces
├── utils/               # Utility classes
├── app.module.ts        # Main application module
└── main.ts             # Application entry point
```

### Available Scripts
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Adding New Data Sources

1. Create a new service in `src/services/`
2. Add the API client configuration in `src/utils/api-client.ts`
3. Update the `MemecoinService` to include the new source
4. Update the response types in `src/types/memecoin.types.ts`

## Error Handling

The API implements comprehensive error handling:
- **Graceful degradation**: If one API fails, others continue to work
- **Detailed error messages**: Each failed source includes error details
- **Validation errors**: Proper validation for token addresses
- **Rate limiting**: Handles API rate limits gracefully

## Rate Limits

Most APIs have generous free tiers:
- **DexScreener**: No rate limits
- **CoinGecko**: 10-30 calls/minute (varies by endpoint)
- **CryptoCompare**: 100,000 calls/month
- **GeckoTerminal**: No rate limits
- **DeFi Llama**: No rate limits
- **Bitquery**: 100,000 points/month

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details
