// Global test setup
import 'reflect-metadata';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.BIRDEYE_API_KEY = 'test-birdeye-key';
process.env.SOLSCAN_API_KEY = 'test-solscan-key';
process.env.GECKOTERMINAL_API_KEY = 'test-geckoterminal-key';
