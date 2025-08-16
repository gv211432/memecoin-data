# Testing Documentation

This document provides comprehensive instructions for testing the Solana Memecoin API services.

## Overview

The project uses Jest as the testing framework with TypeScript support. All tests are organized in the `test/` directory with separate folders for unit tests and integration tests.

## Test Structure

```
test/
├── unit/
│   └── services/
│       ├── birdeye.service.spec.ts
│       ├── dex-screener.service.spec.ts
│       ├── coin-gecko.service.spec.ts
│       ├── memecoin.service.spec.ts
│       └── rugcheck.service.spec.ts
├── integration/
├── mocks/
│   └── axios.mock.ts
├── setup.ts
└── README.md
```

## Running Tests

### Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run Specific Test File
```bash
npm test -- birdeye.service.spec.ts
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

## Service Testing Guide

### 1. BirdeyeService
**File**: `test/unit/services/birdeye.service.spec.ts`

**Key Features Tested**:
- Token data retrieval
- Price history fetching
- Token security analysis
- Error handling for API failures
- Rate limiting scenarios

**Test Command**:
```bash
npm test -- birdeye.service.spec.ts
```

### 2. DexScreenerService
**File**: `test/unit/services/dex-sccreener.service.spec.ts`

**Key Features Tested**:
- Token pair data retrieval
- Price and volume information
- Market cap calculations
- Error handling for invalid tokens

**Test Command**:
```bash
npm test -- dex-screener.service.spec.ts
```

### 3. CoinGeckoService
**File**: `test/unit/services/coin-gecko.service.spec.ts`

**Key Features Tested**:
- Token metadata retrieval
- Market data fetching
- Price history with OHLC data
- API key usage
- Error handling for rate limits

**Test Command**:
```bash
npm test -- coin-gecko.service.spec.ts
```

### 4. MemecoinService
**File**: `test/unit/services/memecoin.service.spec.ts`

**Key Features Tested**:
- Data aggregation from multiple sources
- Fallback handling when services fail
- Success rate calculation
- Token summary generation
- Price history aggregation

**Test Command**:
```bash
npm test -- memecoin.service.spec.ts
```

### 5. RugCheckService
**File**: `test/unit/services/rugcheck.service.spec.ts`

**Key Features Tested**:
- Token security reports
- Risk assessment
- Token information retrieval
- Recent tokens listing
- Risk categories

**Test Command**:
```bash
npm test -- rugcheck.service.spec.ts
```

## Testing Best Practices

### 1. Mocking External APIs
All external API calls are mocked using Jest's mocking capabilities. The `test/mocks/axios.mock.ts` file provides utilities for creating mock responses.

### 2. Error Handling
Each service test includes comprehensive error handling scenarios:
- Network failures
- API rate limits
- Invalid token addresses
- Service unavailability

### 3. Data Validation
Tests verify:
- Response structure
- Data types
- Required fields
- Default values

### 4. Performance Testing
Tests include timeout scenarios to ensure services handle slow responses gracefully.

## Environment Variables for Testing

Create a `.env.test` file for testing-specific configurations:

```bash
# API Keys (use test keys or mock values)
BIRDEYE_API_KEY=test_birdeye_key
COINGECKO_API_KEY=test_coingecko_key

# Test Configuration
TEST_TIMEOUT=10000
MOCK_API_RESPONSES=true
```

## Writing New Tests

### Service Test Template
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from '../../../src/services/your.service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something successfully', async () => {
      // Test implementation
    });

    it('should handle errors gracefully', async () => {
      // Error handling test
    });
  });
});
```

### Mocking Dependencies
```typescript
const mockDependency = {
  methodName: jest.fn(),
};

const module: TestingModule = await Test.createTestingModule({
  providers: [
    YourService,
    {
      provide: DependencyService,
      useValue: mockDependency,
    },
  ],
}).compile();
```

## Debugging Tests

### VS Code Debug Configuration
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Common Debugging Commands
```bash
# Run specific test with verbose output
npm test -- your-test.spec.ts --verbose

# Run tests with coverage for specific file
npm run test:cov -- --testNamePattern="YourService"

# Run tests in band (useful for debugging)
npm test -- --runInBand
```

## Troubleshooting

### Common Issues

1. **Module Not Found Errors**
   - Ensure all dependencies are installed: `npm install --legacy-peer-deps`
   - Check import paths are correct

2. **TypeScript Errors**
   - Run `npm run build` to check for compilation errors
   - Ensure all type definitions are properly imported

3. **Test Timeout Issues**
   - Increase timeout in `jest.config.js`
   - Use `jest.setTimeout(30000)` in specific tests

4. **Mock Not Working**
   - Ensure mocks are cleared with `jest.clearAllMocks()`
   - Check mock implementation matches actual service

### Performance Optimization

1. **Parallel Test Execution**
   - Tests run in parallel by default
   - Use `--runInBand` for debugging or CI environments

2. **Test Isolation**
   - Each test file runs in isolation
   - Global setup in `test/setup.ts` handles common configurations

3. **Memory Management**
   - Large test suites may need increased Node.js memory:
   ```bash
   node --max-old-space-size=4096 ./node_modules/.bin/jest
   ```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci --legacy-peer-deps
      - run: npm test
      - run: npm run test:cov
```

## Coverage Reports

After running tests with coverage:
```bash
npm run test:cov
```

Coverage reports are generated in:
- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format for CI tools

View the HTML report by opening `coverage/lcov-report/index.html` in your browser.

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
