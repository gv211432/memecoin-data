import { Test, TestingModule } from '@nestjs/testing';
import { MemecoinService } from '../../../src/services/memecoin.service';
import { DexScreenerService } from '../../../src/services/dex-screener.service';
import { CoinGeckoService } from '../../../src/services/coin-gecko.service';
import { CryptoCompareService } from '../../../src/services/crypto-compare.service';
import { GeckoTerminalService } from '../../../src/services/gecko-terminal.service';
import { DeFiLlamaService } from '../../../src/services/defi-llama.service';
import { BitqueryService } from '../../../src/services/bitquery.service';
import { BirdeyeService } from '../../../src/services/birdeye.service';
import { PumpFunService } from '../../../src/services/pump-fun.service';
import { RugCheckService } from '../../../src/services/rugcheck.service';

describe('MemecoinService', () => {
  let service: MemecoinService;
  let dexScreenerService: DexScreenerService;
  let coinGeckoService: CoinGeckoService;
  let cryptoCompareService: CryptoCompareService;
  let geckoTerminalService: GeckoTerminalService;
  let defiLlamaService: DeFiLlamaService;
  let bitqueryService: BitqueryService;
  let birdeyeService: BirdeyeService;
  let pumpFunService: PumpFunService;
  let rugCheckService: RugCheckService;

  const mockDexScreenerService = {
    getTokenData: jest.fn(),
    getPriceHistory: jest.fn(),
  };

  const mockCoinGeckoService = {
    getTokenData: jest.fn(),
    getPriceHistory: jest.fn(),
  };

  const mockCryptoCompareService = {
    getTokenData: jest.fn(),
  };

  const mockGeckoTerminalService = {
    getTokenData: jest.fn(),
    getPriceHistory: jest.fn(),
  };

  const mockDeFiLlamaService = {
    getTokenData: jest.fn(),
    getPriceHistory: jest.fn(),
  };

  const mockBitqueryService = {
    getTokenData: jest.fn(),
  };

  const mockBirdeyeService = {
    getTokenData: jest.fn(),
    getPriceHistory: jest.fn(),
  };

  const mockPumpFunService = {
    getTokenData: jest.fn(),
    getPriceHistory: jest.fn(),
  };

  const mockRugCheckService = {
    getTokenSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemecoinService,
        { provide: DexScreenerService, useValue: mockDexScreenerService },
        { provide: CoinGeckoService, useValue: mockCoinGeckoService },
        { provide: CryptoCompareService, useValue: mockCryptoCompareService },
        { provide: GeckoTerminalService, useValue: mockGeckoTerminalService },
        { provide: DeFiLlamaService, useValue: mockDeFiLlamaService },
        { provide: BitqueryService, useValue: mockBitqueryService },
        { provide: BirdeyeService, useValue: mockBirdeyeService },
        { provide: PumpFunService, useValue: mockPumpFunService },
        { provide: RugCheckService, useValue: mockRugCheckService },
      ],
    }).compile();

    service = module.get<MemecoinService>(MemecoinService);
    dexScreenerService = module.get<DexScreenerService>(DexScreenerService);
    coinGeckoService = module.get<CoinGeckoService>(CoinGeckoService);
    cryptoCompareService = module.get<CryptoCompareService>(CryptoCompareService);
    geckoTerminalService = module.get<GeckoTerminalService>(GeckoTerminalService);
    defiLlamaService = module.get<DeFiLlamaService>(DeFiLlamaService);
    bitqueryService = module.get<BitqueryService>(BitqueryService);
    birdeyeService = module.get<BirdeyeService>(BirdeyeService);
    pumpFunService = module.get<PumpFunService>(PumpFunService);
    rugCheckService = module.get<RugCheckService>(RugCheckService);

    jest.clearAllMocks();
  });

  describe('getTokenDetails', () => {
    it('should aggregate data from all services successfully', async () => {
      const mockTokenAddress = 'So11111111111111111111111111111111111111112';
      const mockTimestamp = new Date();

      // Mock successful responses from all services
      const mockResponses = {
        dexScreener: {
          success: true,
          data: { price: 100, marketCap: 5000000000, volume24h: 1000000 },
          timestamp: mockTimestamp,
        },
        coinGecko: {
          success: true,
          data: {
            name: 'Solana',
            symbol: 'SOL',
            current_price: 100,
            market_cap: 50000000000,
            total_volume: 1000000000,
            price_change_percentage_24h: 2.5,
            image: 'https://example.com/solana.png',
            total_supply: 500000000,
          },
          timestamp: mockTimestamp,
        },
        cryptoCompare: {
          success: true,
          data: { price: 100, volume24h: 1000000000 },
          timestamp: mockTimestamp,
        },
        geckoTerminal: {
          success: true,
          data: { price: 100, market_cap: 50000000000, volume_24h: 1000000000 },
          timestamp: mockTimestamp,
        },
        defiLlama: {
          success: true,
          data: { price: 100, marketCap: 50000000000 },
          timestamp: mockTimestamp,
        },
        bitquery: {
          success: true,
          data: { holders: 1000000 },
          timestamp: mockTimestamp,
        },
        birdeye: {
          success: true,
          data: { price: 100, marketCap: 50000000000, volume24h: 1000000000 },
          timestamp: mockTimestamp,
        },
        pumpFun: {
          success: true,
          data: {
            name: 'Solana',
            symbol: 'SOL',
            price: 100,
            marketCap: 50000000000,
            volume24h: 1000000000,
            totalSupply: '500000000',
            image: 'https://example.com/solana.png',
          },
          timestamp: mockTimestamp,
        },
        rugCheck: {
          success: true,
          data: { security: { score: 95, status: 'Safe' } },
          timestamp: mockTimestamp,
        },
      };

      mockDexScreenerService.getTokenData.mockResolvedValue(mockResponses.dexScreener);
      mockCoinGeckoService.getTokenData.mockResolvedValue(mockResponses.coinGecko);
      mockCryptoCompareService.getTokenData.mockResolvedValue(mockResponses.cryptoCompare);
      mockGeckoTerminalService.getTokenData.mockResolvedValue(mockResponses.geckoTerminal);
      mockDeFiLlamaService.getTokenData.mockResolvedValue(mockResponses.defiLlama);
      mockBitqueryService.getTokenData.mockResolvedValue(mockResponses.bitquery);
      mockBirdeyeService.getTokenData.mockResolvedValue(mockResponses.birdeye);
      mockPumpFunService.getTokenData.mockResolvedValue(mockResponses.pumpFun);
      mockRugCheckService.getTokenSummary.mockResolvedValue(mockResponses.rugCheck);

      // Mock price history
      mockDexScreenerService.getPriceHistory.mockResolvedValue({
        success: true,
        data: [
          { timestamp: 1625097600000, price: 95, volume: 1000000 },
          { timestamp: 1625184000000, price: 100, volume: 1500000 },
        ],
        timestamp: mockTimestamp,
      });

      const result = await service.getTokenDetails(mockTokenAddress);

      expect(result.tokenDetails).toEqual({
        address: mockTokenAddress,
        name: 'Solana',
        symbol: 'SOL',
        decimals: 6,
        totalSupply: '500000000',
        marketCap: 50000000000,
        price: 100,
        priceChange24h: 2.5,
        volume24h: 1000000000,
        image: 'https://example.com/solana.png',
        updatedAt: expect.any(Date),
      });

      expect(result.dexScreener).toEqual(mockResponses.dexScreener);
      expect(result.coinGecko).toEqual(mockResponses.coinGecko);
      expect(result.cryptoCompare).toEqual(mockResponses.cryptoCompare);
      expect(result.geckoTerminal).toEqual(mockResponses.geckoTerminal);
      expect(result.defiLlama).toEqual(mockResponses.defiLlama);
      expect(result.bitquery).toEqual(mockResponses.bitquery);
      expect(result.birdeye).toEqual(mockResponses.birdeye);
      expect(result.pumpFun).toEqual(mockResponses.pumpFun);
      expect(result.rugCheck).toEqual(mockResponses.rugCheck);
      expect(result.priceHistory.success).toBe(true);
    });

    it('should handle partial failures gracefully', async () => {
      const mockTokenAddress = 'token123';
      const mockTimestamp = new Date();

      // Mock some services failing
      mockDexScreenerService.getTokenData.mockResolvedValue({
        success: false,
        data: null,
        error: 'Token not found',
        timestamp: mockTimestamp,
      });
      mockCoinGeckoService.getTokenData.mockResolvedValue({
        success: true,
        data: { name: 'Test Token', symbol: 'TEST', current_price: 1 },
        timestamp: mockTimestamp,
      });
      mockCryptoCompareService.getTokenData.mockResolvedValue({
        success: false,
        data: null,
        error: 'API error',
        timestamp: mockTimestamp,
      });
      mockGeckoTerminalService.getTokenData.mockResolvedValue({
        success: true,
        data: { price: 1, market_cap: 1000000 },
        timestamp: mockTimestamp,
      });
      mockDeFiLlamaService.getTokenData.mockResolvedValue({
        success: false,
        data: null,
        error: 'Network error',
        timestamp: mockTimestamp,
      });
      mockBitqueryService.getTokenData.mockResolvedValue({
        success: true,
        data: { holders: 1000 },
        timestamp: mockTimestamp,
      });
      mockBirdeyeService.getTokenData.mockResolvedValue({
        success: false,
        data: null,
        error: 'Rate limit',
        timestamp: mockTimestamp,
      });
      mockPumpFunService.getTokenData.mockResolvedValue({
        success: true,
        data: { name: 'Test Token', symbol: 'TEST', price: 1 },
        timestamp: mockTimestamp,
      });
      mockRugCheckService.getTokenSummary.mockResolvedValue({
        success: true,
        data: { security: { score: 80 } },
        timestamp: mockTimestamp,
      });

      // Mock price history failure
      mockDexScreenerService.getPriceHistory.mockResolvedValue({
        success: false,
        data: null,
        error: 'No history',
        timestamp: mockTimestamp,
      });
      mockCoinGeckoService.getPriceHistory.mockResolvedValue({
        success: false,
        data: null,
        error: 'No history',
        timestamp: mockTimestamp,
      });

      const result = await service.getTokenDetails(mockTokenAddress);

      expect(result.tokenDetails.name).toBe('Test Token');
      expect(result.tokenDetails.symbol).toBe('TEST');
      expect(result.tokenDetails.price).toBe(1);
      expect(result.priceHistory.success).toBe(false);
    });

    it('should use fallback values when no data is available', async () => {
      const mockTokenAddress = 'unknown-token';
      const mockTimestamp = new Date();

      // All services fail
      const mockFailure = {
        success: false,
        data: null,
        error: 'Token not found',
        timestamp: mockTimestamp,
      };

      mockDexScreenerService.getTokenData.mockResolvedValue(mockFailure);
      mockCoinGeckoService.getTokenData.mockResolvedValue(mockFailure);
      mockCryptoCompareService.getTokenData.mockResolvedValue(mockFailure);
      mockGeckoTerminalService.getTokenData.mockResolvedValue(mockFailure);
      mockDeFiLlamaService.getTokenData.mockResolvedValue(mockFailure);
      mockBitqueryService.getTokenData.mockResolvedValue(mockFailure);
      mockBirdeyeService.getTokenData.mockResolvedValue(mockFailure);
      mockPumpFunService.getTokenData.mockResolvedValue(mockFailure);
      mockRugCheckService.getTokenSummary.mockResolvedValue(mockFailure);

      const result = await service.getTokenDetails(mockTokenAddress);

      expect(result.tokenDetails).toEqual({
        address: mockTokenAddress,
        name: 'Unknown Token',
        symbol: 'UNKNOWN',
        decimals: 6,
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('getTokenSummary', () => {
    it('should return a summary with success rate', async () => {
      const mockTokenAddress = 'token123';
      const mockTimestamp = new Date();

      // Mock getTokenDetails
      jest.spyOn(service, 'getTokenDetails').mockResolvedValue({
        tokenDetails: {
          address: mockTokenAddress,
          name: 'Test Token',
          symbol: 'TEST',
          price: 1.5,
          marketCap: 1500000,
          volume24h: 50000,
          priceChange24h: 5.2,
          holders: 1000,
          decimals: 6,
          updatedAt: mockTimestamp,
        },
        dexScreener: { success: true, data: { price: 1.5 }, timestamp: mockTimestamp },
        coinGecko: { success: true, data: { name: 'Test' }, timestamp: mockTimestamp },
        cryptoCompare: { success: false, data: null, error: 'Failed', timestamp: mockTimestamp },
        geckoTerminal: { success: true, data: { price: 1.5 }, timestamp: mockTimestamp },
        solanaTracker: { success: false, data: null, error: 'Not implemented', timestamp: mockTimestamp },
        defiLlama: { success: true, data: { price: 1.5 }, timestamp: mockTimestamp },
        bitquery: { success: false, data: null, error: 'Failed', timestamp: mockTimestamp },
        birdeye: { success: true, data: { price: 1.5 }, timestamp: mockTimestamp },
        pumpFun: { success: false, data: null, error: 'Failed', timestamp: mockTimestamp },
        rugCheck: { success: true, data: { security: { score: 85, status: 'Good' } }, timestamp: mockTimestamp },
        priceHistory: { success: true, data: [], timestamp: mockTimestamp },
      });

      const result = await service.getTokenSummary(mockTokenAddress);

      expect(result).toEqual({
        address: mockTokenAddress,
        name: 'Test Token',
        symbol: 'TEST',
        price: 1.5,
        marketCap: 1500000,
        volume24h: 50000,
        priceChange24h: 5.2,
        holders: 1000,
        successRate: 66.67, // 6 out of 9 successful
        sources: {
          dexScreener: true,
          coinGecko: true,
          cryptoCompare: false,
          geckoTerminal: true,
          defiLlama: true,
          bitquery: false,
          birdeye: true,
          pumpFun: false,
          rugCheck: true,
        },
        security: { score: 85, status: 'Good' },
        timestamp: expect.any(Date),
      });
    });
  });

  describe('getAggregatedPriceHistory', () => {
    it('should return first successful price history', async () => {
      const mockTokenAddress = 'token123';
      const mockTimestamp = new Date();
      const mockPriceHistory = [
        { timestamp: 1625097600000, price: 100, volume: 1000000 },
        { timestamp: 1625184000000, price: 105, volume: 1500000 },
      ];

      // First few services fail
      mockDexScreenerService.getPriceHistory.mockResolvedValue({
        success: false,
        data: null,
        error: 'No data',
        timestamp: mockTimestamp,
      });
      mockCoinGeckoService.getPriceHistory.mockResolvedValue({
        success: false,
        data: null,
        error: 'No data',
        timestamp: mockTimestamp,
      });
      
      // Third service succeeds
      mockGeckoTerminalService.getPriceHistory.mockResolvedValue({
        success: true,
        data: mockPriceHistory,
        timestamp: mockTimestamp,
      });

      const result = await service['getAggregatedPriceHistory'](mockTokenAddress);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPriceHistory);
      expect(mockDeFiLlamaService.getPriceHistory).not.toHaveBeenCalled();
    });

    it('should return error when all services fail', async () => {
      const mockTokenAddress = 'token123';
      const mockTimestamp = new Date();

      // All services fail
      const mockFailure = {
        success: false,
        data: null,
        error: 'No data',
        timestamp: mockTimestamp,
      };

      mockDexScreenerService.getPriceHistory.mockResolvedValue(mockFailure);
      mockCoinGeckoService.getPriceHistory.mockResolvedValue(mockFailure);
      mockGeckoTerminalService.getPriceHistory.mockResolvedValue(mockFailure);
      mockDeFiLlamaService.getPriceHistory.mockResolvedValue(mockFailure);
      mockBirdeyeService.getPriceHistory.mockResolvedValue(mockFailure);
      mockPumpFunService.getPriceHistory.mockResolvedValue(mockFailure);

      const result = await service['getAggregatedPriceHistory'](mockTokenAddress);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('No price history available from any source');
    });
  });
});
