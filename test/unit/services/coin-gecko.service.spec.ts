import { Test, TestingModule } from '@nestjs/testing';
import { CoinGeckoService } from '../../../src/services/coin-gecko.service';
import { ApiClient } from '../../../src/utils/api-client';
import { ConfigService } from '@nestjs/config';

describe('CoinGeckoService', () => {
  let service: CoinGeckoService;
  let apiClient: ApiClient;

  const mockApiClient = {
    safeGet: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinGeckoService,
        {
          provide: ApiClient,
          useValue: mockApiClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CoinGeckoService>(CoinGeckoService);
    apiClient = module.get<ApiClient>(ApiClient);
    jest.clearAllMocks();
  });

  describe('getTokenData', () => {
    it('should return token data successfully', async () => {
      const mockTokenAddress = 'So11111111111111111111111111111111111111112';
      const mockApiResponse = {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        image: { large: 'https://example.com/solana.png' },
        market_data: {
          current_price: { usd: 100 },
          market_cap: { usd: 50000000000 },
          market_cap_rank: 5,
          fully_diluted_valuation: { usd: 60000000000 },
          total_volume: { usd: 1000000000 },
          high_24h: { usd: 105 },
          low_24h: { usd: 95 },
          price_change_24h: 2.5,
          price_change_percentage_24h: 2.5,
          market_cap_change_24h: 1000000000,
          market_cap_change_percentage_24h: 2.0,
          circulating_supply: 400000000,
          total_supply: 500000000,
          max_supply: 1000000000,
          ath: { usd: 260 },
          ath_change_percentage: { usd: -61.5 },
          ath_date: { usd: '2021-11-06T00:00:00.000Z' },
          atl: { usd: 0.5 },
          atl_change_percentage: { usd: 19900 },
          atl_date: { usd: '2020-05-11T00:00:00.000Z' },
        },
      };

      mockApiClient.safeGet.mockResolvedValue({
        success: true,
        data: mockApiResponse,
      });

      const result = await service.getTokenData(mockTokenAddress);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        image: 'https://example.com/solana.png',
        current_price: 100,
        market_cap: 50000000000,
        market_cap_rank: 5,
        fully_diluted_valuation: 60000000000,
        total_volume: 1000000000,
        high_24h: 105,
        low_24h: 95,
        price_change_24h: 2.5,
        price_change_percentage_24h: 2.5,
        market_cap_change_24h: 1000000000,
        market_cap_change_percentage_24h: 2.0,
        circulating_supply: 400000000,
        total_supply: 500000000,
        max_supply: 1000000000,
        ath: 260,
        ath_change_percentage: -61.5,
        ath_date: '2021-11-06T00:00:00.000Z',
        atl: 0.5,
        atl_change_percentage: 19900,
        atl_date: '2020-05-11T00:00:00.000Z',
      });
      expect(apiClient.safeGet).toHaveBeenCalledWith(
        'coingecko',
        '/coins/solana/contract/So11111111111111111111111111111111111111112',
        {}
      );
    });

    it('should use API key when provided', async () => {
      const mockTokenAddress = 'token123';
      mockConfigService.get.mockReturnValue('test-api-key');
      mockApiClient.safeGet.mockResolvedValue({
        success: true,
        data: { id: 'test-token', symbol: 'test', name: 'Test Token' },
      });

      await service.getTokenData(mockTokenAddress);

      expect(apiClient.safeGet).toHaveBeenCalledWith(
        'coingecko',
        '/coins/solana/contract/token123',
        { x_cg_demo_api_key: 'test-api-key' }
      );
    });

    it('should handle token not found', async () => {
      const mockTokenAddress = 'invalid-token';
      mockApiClient.safeGet.mockResolvedValue({
        success: false,
        data: null,
        error: 'Token not found',
      });

      const result = await service.getTokenData(mockTokenAddress);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Token not found on CoinGecko');
    });

    it('should handle API errors gracefully', async () => {
      const mockTokenAddress = 'token123';
      mockApiClient.safeGet.mockResolvedValue({
        success: false,
        data: null,
        error: 'API rate limit exceeded',
      });

      const result = await service.getTokenData(mockTokenAddress);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('API rate limit exceeded');
    });
  });

  describe('getPriceHistory', () => {
    it('should return price history successfully', async () => {
      const mockTokenAddress = 'So11111111111111111111111111111111111111112';
      const mockApiResponse = {
        prices: [
          [1625097600000, 100],
          [1625184000000, 105],
          [1625270400000, 110],
        ],
        total_volumes: [
          [1625097600000, 1000000],
          [1625184000000, 1500000],
          [1625270400000, 2000000],
        ],
      };

      mockApiClient.safeGet.mockResolvedValue({
        success: true,
        data: mockApiResponse,
      });

      const result = await service.getPriceHistory(mockTokenAddress, 7);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        { timestamp: 1625097600000, price: 100, volume: 1000000 },
        { timestamp: 1625184000000, price: 105, volume: 1500000 },
        { timestamp: 1625270400000, price: 110, volume: 2000000 },
      ]);
      expect(apiClient.safeGet).toHaveBeenCalledWith(
        'coingecko',
        '/coins/solana/contract/So11111111111111111111111111111111111111112/market_chart',
        {
          days: 7,
          vs_currency: 'usd',
        }
      );
    });

    it('should use default days parameter', async () => {
      const mockTokenAddress = 'token123';
      mockApiClient.safeGet.mockResolvedValue({
        success: true,
        data: { prices: [], total_volumes: [] },
      });

      await service.getPriceHistory(mockTokenAddress);

      expect(apiClient.safeGet).toHaveBeenCalledWith(
        'coingecko',
        '/coins/solana/contract/token123/market_chart',
        {
          days: 7,
          vs_currency: 'usd',
        }
      );
    });

    it('should handle empty price history', async () => {
      const mockTokenAddress = 'token123';
      mockApiClient.safeGet.mockResolvedValue({
        success: true,
        data: { prices: [], total_volumes: [] },
      });

      const result = await service.getPriceHistory(mockTokenAddress);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle API errors', async () => {
      const mockTokenAddress = 'token123';
      mockApiClient.safeGet.mockResolvedValue({
        success: false,
        data: null,
        error: 'Network error',
      });

      const result = await service.getPriceHistory(mockTokenAddress);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Price history not found');
    });
  });
});
