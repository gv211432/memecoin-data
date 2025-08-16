import { Test, TestingModule } from '@nestjs/testing';
import { DexScreenerService } from '../../../src/services/dex-screener.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DexScreenerService', () => {
  let service: DexScreenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DexScreenerService],
    }).compile();

    service = module.get<DexScreenerService>(DexScreenerService);
    jest.clearAllMocks();
  });

  describe('getTokenData', () => {
    it('should return token data successfully', async () => {
      const mockResponse = {
        data: {
          pairs: [
            {
              chainId: 'solana',
              dexId: 'raydium',
              url: 'https://dexscreener.com/solana/pair-address',
              pairAddress: 'pair-address',
              labels: ['V2', 'AMM'],
              baseToken: {
                address: 'token-address',
                name: 'Test Token',
                symbol: 'TEST',
              },
              quoteToken: {
                address: 'So11111111111111111111111111111111111111112',
                name: 'Wrapped SOL',
                symbol: 'SOL',
              },
              priceNative: 0.001,
              priceUsd: 0.001234,
              volume: {
                h24: 1000000,
                h6: 500000,
                h1: 100000,
              },
              priceChange: {
                h24: 5.67,
                h6: 2.34,
                h1: 1.23,
              },
              liquidity: {
                usd: 100000,
              },
              fdv: 5000000,
              pairCreatedAt: 1234567890000,
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getTokenData('token-address');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        price: 0.001234,
        priceChange24h: 5.67,
        volume24h: 1000000,
        liquidity: 100000,
        marketCap: 5000000,
        symbol: 'TEST',
        name: 'Test Token',
        image: undefined,
        pairAddress: 'pair-address',
        dexId: 'raydium',
      });
    });

    it('should handle no pairs found', async () => {
      const mockResponse = { data: { pairs: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getTokenData('token-address');
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('No trading pairs found');
    });

    it('should handle API failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getTokenData('invalid-address');
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });
  });

  describe('getTrendingTokens', () => {
    it('should return trending tokens successfully', async () => {
      const mockResponse = {
        data: {
          pairs: [
            {
              baseToken: { symbol: 'TEST1', address: 'token1' },
              priceUsd: 0.001,
              volume: { h24: 1000000 },
            },
            {
              baseToken: { symbol: 'TEST2', address: 'token2' },
              priceUsd: 0.002,
              volume: { h24: 2000000 },
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getTrendingTokens();
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].symbol).toBe('TEST1');
    });

    it('should handle trending API failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API error'));

      const result = await service.getTrendingTokens();
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });
});
