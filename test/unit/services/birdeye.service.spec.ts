import { Test, TestingModule } from '@nestjs/testing';
import { BirdeyeService } from '../../../src/services/birdeye.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BirdeyeService', () => {
  let service: BirdeyeService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-birdeye-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirdeyeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<BirdeyeService>(BirdeyeService);
    configService = module.get<ConfigService>(ConfigService);
    jest.clearAllMocks();
  });

  describe('getTokenData', () => {
    it('should return token data successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            address: 'token-address',
            symbol: 'TEST',
            name: 'Test Token',
            decimals: 6,
            price: 0.001234,
            price_change_24h: 5.67,
            volume_24h: 1000000,
            market_cap: 5000000,
            liquidity: 100000,
            last_trade_unix_time: 1234567890,
            image_uri: 'https://example.com/image.png',
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getTokenData('token-address');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        price: 0.001234,
        priceChange24h: 5.67,
        volume24h: 1000000,
        marketCap: 5000000,
        liquidity: 100000,
        symbol: 'TEST',
        name: 'Test Token',
        image: 'https://example.com/image.png',
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://public-api.birdeye.so/defi/token_overview?address=token-address',
        expect.objectContaining({
          headers: { 'X-API-KEY': 'test-birdeye-key' },
          timeout: 10000,
        })
      );
    });

    it('should handle API failure gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getTokenData('invalid-address');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('should handle missing API key', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      const mockResponse = {
        data: {
          success: true,
          data: {
            address: 'token-address',
            symbol: 'TEST',
            name: 'Test Token',
            decimals: 6,
            price: 0.001234,
            price_change_24h: 5.67,
            volume_24h: 1000000,
            market_cap: 5000000,
            liquidity: 100000,
            last_trade_unix_time: 1234567890,
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getTokenData('token-address');

      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {},
        })
      );
    });
  });

  describe('getPriceHistory', () => {
    it('should return price history successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            items: [
              { unixTime: 1234567890, value: 0.001, volume: 1000 },
              { unixTime: 1234567891, value: 0.0011, volume: 1100 },
            ],
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getPriceHistory('token-address', 7);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        timestamp: 1234567890000,
        price: 0.001,
        volume: 1000,
      });
    });

    it('should handle empty price history', async () => {
      const mockResponse = {
        data: {
          success: false,
          data: null,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getPriceHistory('token-address');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('No price history data available');
    });
  });

  describe('getTokenSecurity', () => {
    it('should return security data successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            ownerBalance: 1000000,
            creatorBalance: 500000,
            top10HolderBalance: 8000000,
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getTokenSecurity('token-address');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle security API failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API limit exceeded'));

      const result = await service.getTokenSecurity('token-address');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('API limit exceeded');
    });
  });
});
