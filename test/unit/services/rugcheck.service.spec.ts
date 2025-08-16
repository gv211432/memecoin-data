import { Test, TestingModule } from '@nestjs/testing';
import { RugCheckService } from '../../../src/services/rugcheck.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RugCheckService', () => {
  let service: RugCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RugCheckService],
    }).compile();

    service = module.get<RugCheckService>(RugCheckService);
    jest.clearAllMocks();
  });

  describe('getTokenReport', () => {
    it('should return token report successfully', async () => {
      const mockTokenAddress = 'So11111111111111111111111111111111111111112';
      const mockResponse = {
        data: {
          token: mockTokenAddress,
          score: 85,
          risks: [
            {
              name: 'Mint Authority',
              level: 'low',
              description: 'Mint authority is disabled',
            },
            {
              name: 'Freeze Authority',
              level: 'medium',
              description: 'Freeze authority is enabled',
            },
          ],
          markets: [
            {
              marketId: 'market1',
              score: 90,
              risks: [],
            },
          ],
          totalRisk: 15,
          totalRisks: 2,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getTokenReport(mockTokenAddress);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        score: 85,
        totalRisk: 15,
        totalRisks: 2,
        risks: mockResponse.data.risks,
        markets: mockResponse.data.markets,
        isHighRisk: false,
        isMediumRisk: true,
        isLowRisk: true,
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://api.rugcheck.xyz/v1/tokens/${mockTokenAddress}/report`,
        { timeout: 10000 }
      );
    });

    it('should handle high risk tokens', async () => {
      const mockTokenAddress = 'risky-token';
      const mockResponse = {
        data: {
          token: mockTokenAddress,
          score: 30,
          risks: [
            {
              name: 'Mint Authority',
              level: 'critical',
              description: 'Mint authority is enabled',
            },
          ],
          markets: [],
          totalRisk: 70,
          totalRisks: 1,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getTokenReport(mockTokenAddress);

      expect(result.success).toBe(true);
      expect(result.data?.isHighRisk).toBe(true);
      expect(result.data?.isMediumRisk).toBe(false);
      expect(result.data?.isLowRisk).toBe(false);
    });

    it('should handle API errors', async () => {
      const mockTokenAddress = 'token123';
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getTokenReport(mockTokenAddress);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('should handle empty response', async () => {
      const mockTokenAddress = 'token123';
      mockedAxios.get.mockResolvedValue({ data: null });

      const result = await service.getTokenReport(mockTokenAddress);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('No data received from RugCheck');
    });

    it('should handle timeout errors', async () => {
      const mockTokenAddress = 'token123';
      mockedAxios.get.mockRejectedValue(new Error('timeout of 10000ms exceeded'));

      const result = await service.getTokenReport(mockTokenAddress);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('timeout of 10000ms exceeded');
    });
  });

  describe('getTokenInfo', () => {
    it('should return token info successfully', async () => {
      const mockTokenAddress = 'So11111111111111111111111111111111111111112';
      const mockResponse = {
        data: {
          mint: mockTokenAddress,
          owner: 'owner123',
          ownerBalance: 1000000,
          decimals: 9,
          supply: '1000000000',
          isMutable: false,
          updateAuthority: 'update123',
          freezeAuthority: 'freeze123',
          name: 'Test Token',
          symbol: 'TEST',
          uri: 'https://example.com/metadata.json',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getTokenInfo(mockTokenAddress);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://api.rugcheck.xyz/v1/tokens/${mockTokenAddress}`,
        { timeout: 10000 }
      );
    });

    it('should handle token not found', async () => {
      const mockTokenAddress = 'invalid-token';
      mockedAxios.get.mockRejectedValue(new Error('404 Not Found'));

      const result = await service.getTokenInfo(mockTokenAddress);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('404 Not Found');
    });
  });

  describe('getTokenSummary', () => {
    it('should return combined report and info successfully', async () => {
      const mockTokenAddress = 'token123';
      const mockReport = {
        success: true,
        data: {
          score: 85,
          totalRisk: 15,
          isLowRisk: true,
        },
      };
      const mockInfo = {
        success: true,
        data: {
          name: 'Test Token',
          symbol: 'TEST',
          decimals: 9,
        },
      };

      jest.spyOn(service, 'getTokenReport').mockResolvedValue(mockReport as any);
      jest.spyOn(service, 'getTokenInfo').mockResolvedValue(mockInfo as any);

      const result = await service.getTokenSummary(mockTokenAddress);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        security: mockReport.data,
        tokenInfo: mockInfo.data,
      });
    });

    it('should handle report failure', async () => {
      const mockTokenAddress = 'token123';
      const mockReport = {
        success: false,
        data: null,
        error: 'Report failed',
      };
      const mockInfo = {
        success: true,
        data: { name: 'Test Token' },
      };

      jest.spyOn(service, 'getTokenReport').mockResolvedValue(mockReport as any);
      jest.spyOn(service, 'getTokenInfo').mockResolvedValue(mockInfo as any);

      const result = await service.getTokenSummary(mockTokenAddress);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to get complete token summary');
    });

    it('should handle info failure', async () => {
      const mockTokenAddress = 'token123';
      const mockReport = {
        success: true,
        data: { score: 85 },
      };
      const mockInfo = {
        success: false,
        data: null,
        error: 'Info failed',
      };

      jest.spyOn(service, 'getTokenReport').mockResolvedValue(mockReport as any);
      jest.spyOn(service, 'getTokenInfo').mockResolvedValue(mockInfo as any);

      const result = await service.getTokenSummary(mockTokenAddress);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to get complete token summary');
    });

    it('should handle both failures', async () => {
      const mockTokenAddress = 'token123';
      const mockReport = {
        success: false,
        data: null,
        error: 'Report failed',
      };
      const mockInfo = {
        success: false,
        data: null,
        error: 'Info failed',
      };

      jest.spyOn(service, 'getTokenReport').mockResolvedValue(mockReport as any);
      jest.spyOn(service, 'getTokenInfo').mockResolvedValue(mockInfo as any);

      const result = await service.getTokenSummary(mockTokenAddress);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to get complete token summary');
    });
  });

  describe('getRecentTokens', () => {
    it('should return recent tokens successfully', async () => {
      const mockResponse = {
        data: [
          { mint: 'token1', name: 'Token 1', symbol: 'TK1' },
          { mint: 'token2', name: 'Token 2', symbol: 'TK2' },
        ],
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getRecentTokens(10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/v1/tokens/recent?limit=10',
        { timeout: 10000 }
      );
    });

    it('should use default limit when not provided', async () => {
      const mockResponse = { data: [] };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await service.getRecentTokens();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/v1/tokens/recent?limit=20',
        { timeout: 10000 }
      );
    });

    it('should handle empty response', async () => {
      mockedAxios.get.mockResolvedValue({ data: null });

      const result = await service.getRecentTokens();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Service unavailable'));

      const result = await service.getRecentTokens();

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Service unavailable');
    });
  });

  describe('getRiskCategories', () => {
    it('should return risk categories successfully', async () => {
      const mockResponse = {
        data: [
          { id: 'mint-authority', name: 'Mint Authority', description: 'Token minting risks' },
          { id: 'freeze-authority', name: 'Freeze Authority', description: 'Token freezing risks' },
        ],
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getRiskCategories();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/v1/risk-categories',
        { timeout: 10000 }
      );
    });

    it('should handle empty response', async () => {
      mockedAxios.get.mockResolvedValue({ data: null });

      const result = await service.getRiskCategories();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API limit exceeded'));

      const result = await service.getRiskCategories();

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('API limit exceeded');
    });
  });
});
