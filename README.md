<div align="center">
  <img src="memecoin-data.png" alt="Memecoin Data API" width="200" height="200">
  
  <h1 align="center">🚀 Solana Memecoin Data API</h1>
  
  <p align="center">
    <strong>Comprehensive REST API for Solana memecoin analytics and data aggregation</strong>
    <br>
    <em>Real-time data from 9+ sources • TypeScript • NestJS • Production-ready</em>
  </p>
  
  <p align="center">
    <a href="https://github.com/gv211432/memecoin-data/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/gv211432/memecoin-data?style=flat-square" alt="License">
    </a>
    <a href="https://github.com/gv211432/memecoin-data/stargazers">
      <img src="https://img.shields.io/github/stars/gv211432/memecoin-data?style=flat-square" alt="Stars">
    </a>
    <a href="https://github.com/gv211432/memecoin-data/issues">
      <img src="https://img.shields.io/github/issues/gv211432/memecoin-data?style=flat-square" alt="Issues">
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/node-18+-green?style=flat-square" alt="Node">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/typescript-5.0+-blue?style=flat-square" alt="TypeScript">
    </a>
    <a href="https://nestjs.com/">
      <img src="https://img.shields.io/badge/nestjs-10.0+-red?style=flat-square" alt="NestJS">
    </a>
  </p>
</div>

## 📋 Table of Contents
- [🌟 Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📊 API Documentation](#-api-documentation)
- [🔧 Configuration](#-configuration)
- [🏗️ Architecture](#️-architecture)
- [📈 Supported Data Sources](#-supported-data-sources)
- [🛠️ Development](#️-development)
- [🧪 Testing](#-testing)
- [🎯 CLI Tool](#-cli-tool)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 Features

### Core Capabilities
- **🔍 Multi-source aggregation** - 9+ data sources with intelligent fallback
- **⚡ Real-time data** - Live prices, volumes, and market metrics
- **📊 Historical analytics** - Price history, volume trends, and market cap evolution
- **🛡️ Security analysis** - Rug check reports and token security scores
- **🎨 Rich metadata** - Token images, descriptions, social links
- **🔄 Graceful degradation** - Continues working even if individual APIs fail

### Technical Excellence
- **🎯 TypeScript-first** - Full type safety with comprehensive interfaces
- **🏗️ NestJS architecture** - Modular, scalable, and production-ready
- **📦 Docker support** - Containerized deployment ready
- **🧪 Comprehensive testing** - Unit and integration tests
- **📖 Self-documenting** - OpenAPI/Swagger documentation
- **🔍 Advanced logging** - Request/response logging with correlation IDs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/gv211432/memecoin-data.git
cd memecoin-data

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Docker Deployment

```bash
# Build and run with Docker
docker build -t memecoin-data .
docker run -p 3000:3000 --env-file .env memecoin-data
```

## 📊 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
No authentication required for basic usage. API keys are optional for enhanced rate limits.

### Endpoints

#### Get Token Details
```http
GET /api/memecoin/details?address={token_address}
POST /api/memecoin/details
Content-Type: application/json

{
  "address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
}
```

#### Get Token Summary
```http
GET /api/memecoin/summary?address={token_address}
```

#### Get Price History
```http
GET /api/memecoin/price-history?address={token_address}&days=7
```

#### Health Check
```http
GET /api/memecoin/health
```

### Example Response

```json
{
  "success": true,
  "data": {
    "tokenDetails": {
      "address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      "name": "Bonk",
      "symbol": "BONK",
      "decimals": 5,
      "price": 0.0000254,
      "marketCap": 1650000000,
      "volume24h": 85420000,
      "priceChange24h": 12.5,
      "image": "https://assets.coingecko.com/coins/images/28600/large/bonk.jpg"
    },
    "sources": {
      "dexScreener": {
        "success": true,
        "data": { "price": 0.0000254, "volume24h": 85420000 },
        "timestamp": "2024-08-16T15:30:00.000Z"
      },
      "coinGecko": {
        "success": true,
        "data": { "price": 0.0000254, "marketCap": 1650000000 },
        "timestamp": "2024-08-16T15:30:00.000Z"
      },
      "birdeye": {
        "success": true,
        "data": { "liquidity": 2500000, "holders": 450000 },
        "timestamp": "2024-08-16T15:30:00.000Z"
      },
      "rugCheck": {
        "success": true,
        "data": { "score": 85, "isLowRisk": true },
        "timestamp": "2024-08-16T15:30:00.000Z"
      }
    }
  }
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Optional API Keys (for enhanced rate limits)
COINGECKO_API_KEY=your_coingecko_api_key
CRYPTOCOMPARE_API_KEY=your_cryptocompare_api_key
BITQUERY_API_KEY=your_bitquery_api_key
BIRDEYE_API_KEY=your_birdeye_api_key

# Logging
LOG_LEVEL=info
```

### Rate Limits & API Keys

| API / Source             | Purpose (Key Data Provided)                             | Status |
| ------------------------ | ------------------------------------------------------- | ------ |
| **DexScreener API**      | Real-time token prices, volume, liquidity, MC           | ✅     |
| **CoinGecko API**        | Pricing, MC, volume, supply, historical                 | ✅     |
| **CryptoCompare API**    | Market data, pricing, trades                            | ✅     |
| **GeckoTerminal API**    | DEX token data, prices, pairs                           | ✅     |
| **DeFi Llama API**       | TVL, protocol analytics, chains                         | ✅     |
| **Bitquery API**         | On-chain transactions, token transfers                  | ✅     |
| **Birdeye API**          | Solana-specific token data: holders, liquidity, wallets | ✅     |
| **RugCheck API**         | Token security: LP lock %, mintable, freeze flags       | ✅     |
| **PumpFun API (scrape)** | Origin of memecoins, metadata                           | ✅     |
| **CoinMarketCap API**    | Market cap, volume, supply, historical data             | ⚠️     |
| **PancakeSwap API**      | BSC token prices, LP info, trades                       | ⚠️     |
| **Messari API**          | Fundamentals, metrics, analytics                        | ⚠️     |
| **Nomics API**           | MC, price history, order book                           | ⚠️     |
| **Token Metrics API**    | On-chain token performance & metrics                    | ⚠️     |
| **Solana Tracker API**   | Solana token supply, holders, distribution              | ⚠️     |
| **Moralis API**          | Multi-chain token balances, holders                     | ⚠️     |
| **Jupiter API**          | Solana liquidity routing, price quotes                  | ⚠️     |
| **Helius API**           | Solana-specific analytics, metadata, RPC indexing       | ⚠️     |

✅ **Integrated now** → Already usable in your project <br/>
⚠️ **Planned soon** → Useful additions (depending on scaling + limits)

## 🏗️ Architecture

### Project Structure
```
src/
├── controllers/
│   └── memecoin.controller.ts    # REST endpoints
├── services/
│   ├── memecoin.service.ts       # Main aggregation service
│   ├── birdeye.service.ts        # Birdeye API integration
│   ├── coin-gecko.service.ts     # CoinGecko API integration
│   ├── dex-screener.service.ts   # DexScreener API integration
│   ├── gecko-terminal.service.ts # GeckoTerminal API integration
│   ├── pump-fun.service.ts       # PumpFun API integration
│   ├── rugcheck.service.ts       # RugCheck API integration
│   ├── bitquery.service.ts       # Bitquery API integration
│   ├── crypto-compare.service.ts # CryptoCompare API integration
│   └── defi-llama.service.ts     # DeFi Llama API integration
├── dto/
│   └── token-request.dto.ts      # Request validation
├── types/
│   ├── memecoin.types.ts         # Core interfaces
│   ├── birdeye.types.ts          # Birdeye-specific types
│   ├── pump-fun.types.ts         # PumpFun-specific types
│   ├── rugcheck.types.ts         # RugCheck-specific types
│   └── cli.types.ts              # CLI interfaces
├── utils/
│   └── api-client.ts             # Centralized HTTP client
├── app.module.ts                 # NestJS module configuration
├── main.ts                       # Application bootstrap
└── cli.ts                        # Interactive CLI tool
```

### Data Flow
1. **Request** → Validation via DTOs
2. **Aggregation** → Parallel calls to all configured sources
3. **Processing** → Data normalization and error handling
4. **Response** → Unified format with source-specific details

## 📈 Supported Data Sources

### Primary Data Sources
| Source | Data Provided | Reliability | Update Frequency |
|--------|---------------|-------------|------------------|
| **DexScreener** | Real-time prices, volume, liquidity | High | Real-time |
| **CoinGecko** | Market data, metadata, historical | High | 1-2 minutes |
| **GeckoTerminal** | DEX analytics, OHLCV data | High | Real-time |
| **Birdeye** | Solana-specific metrics, holder data | High | Real-time |
| **DeFi Llama** | Cross-chain pricing, TVL | High | 5 minutes |

### Security & Analytics
| Source | Data Provided | Use Case |
|--------|---------------|----------|
| **RugCheck** | Security scores, risk flags | Token safety analysis |
| **PumpFun** | Memecoin metadata, social links | Community insights |
| **Bitquery** | On-chain transactions, transfers | Blockchain analytics |
| **CryptoCompare** | Market data, trading pairs | Price validation |

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup Development Environment
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run start:dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Start production server
npm run start:prod
```

### Available Scripts
```bash
npm run start:dev     # Development with hot reload
npm run start:debug   # Debug mode with breakpoints
npm run start:prod    # Production mode
npm run build         # Build project
npm run test          # Run tests
npm run test:watch    # Watch mode testing
npm run test:cov      # Coverage report
npm run lint          # Lint code
npm run lint:fix      # Fix linting issues
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Test Structure
```
test/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── mocks/            # Mock data and services
└── setup.ts          # Test configuration
```

## 🎯 CLI Tool

Interactive CLI for testing and development:

```bash
# Start interactive CLI
npm run cli

# CLI features:
# - Browse all available services
# - Test individual API endpoints
# - Debug token data retrieval
# - Interactive token address input
```

### CLI Usage Example
```bash
$ npm run cli

🚀 Solana Memecoin API CLI Tool

Select a service:
❯ dex-screener (2 methods)
  coin-gecko (3 methods)
  birdeye (3 methods)
  pump-fun (4 methods)
  rugcheck (5 methods)

Select method: getTokenData
Enter token address: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263

✅ Successfully retrieved data for BONK token
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Use conventional commit messages

### Adding New Data Sources
1. Create service in `src/services/`
2. Add API configuration in `src/utils/api-client.ts`
3. Update types in `src/types/`
4. Add tests in `test/unit/services/`
5. Update README documentation

## 🐛 Troubleshooting

### Common Issues

#### API Rate Limits
```bash
# Check rate limit headers in logs
LOG_LEVEL=debug npm run start:dev
```

#### Missing API Keys
```bash
# Services work without keys but with lower limits
# Add keys to .env for enhanced rate limits
```

#### TypeScript Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode
```bash
# Enable detailed logging
DEBUG=* npm run start:dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) framework
- Powered by multiple excellent cryptocurrency data providers
- Community-driven development and contributions

---

<div align="center">
  <p>
    <strong>⭐ Star this repo if you find it useful!</strong>
  </p>
  <p>
    <a href="https://github.com/gv211432/memecoin-data">View on GitHub</a> •
    <a href="https://github.com/gv211432/memecoin-data/issues">Report Issues</a> •
    <a href="https://github.com/gv211432/memecoin-data/discussions">Discussions</a>
  </p>
</div>
