import { Injectable } from '@nestjs/common';
import { DexScreenerService } from './dex-screener.service';
import { CoinGeckoService } from './coin-gecko.service';
import { CryptoCompareService } from './crypto-compare.service';
import { GeckoTerminalService } from './gecko-terminal.service';
import { DeFiLlamaService } from './defi-llama.service';
import { BitqueryService } from './bitquery.service';
import { BirdeyeService } from './birdeye.service';
import { PumpFunService } from './pump-fun.service';
import { RugCheckService } from './rugcheck.service';
import { MemecoinAggregateData, TokenDetails, APIResponse } from '../types/memecoin.types';

@Injectable()
export class MemecoinService {
  constructor(
    private readonly dexScreenerService: DexScreenerService,
    private readonly coinGeckoService: CoinGeckoService,
    private readonly cryptoCompareService: CryptoCompareService,
    private readonly geckoTerminalService: GeckoTerminalService,
    private readonly defiLlamaService: DeFiLlamaService,
    private readonly bitqueryService: BitqueryService,
    private readonly birdeyeService: BirdeyeService,
    private readonly pumpFunService: PumpFunService,
    private readonly rugCheckService: RugCheckService,
  ) { }

  async getTokenDetails(tokenAddress: string): Promise<MemecoinAggregateData> {
    // Fetch all data in parallel
    const [
      dexScreener,
      coinGecko,
      cryptoCompare,
      geckoTerminal,
      defiLlama,
      bitquery,
      birdeye,
      pumpFun,
      rugCheck,
    ] = await Promise.all([
      this.dexScreenerService.getTokenData(tokenAddress),
      this.coinGeckoService.getTokenData(tokenAddress),
      this.cryptoCompareService.getTokenData(tokenAddress),
      this.geckoTerminalService.getTokenData(tokenAddress),
      this.defiLlamaService.getTokenData(tokenAddress),
      this.bitqueryService.getTokenData(tokenAddress),
      this.birdeyeService.getTokenData(tokenAddress),
      this.pumpFunService.getTokenData(tokenAddress),
      this.rugCheckService.getTokenSummary(tokenAddress),
    ]);

    // Get price history from multiple sources
    const priceHistory = await this.getAggregatedPriceHistory(tokenAddress);

    // Build token details from available data
    const tokenDetails = this.buildTokenDetails(
      tokenAddress,
      coinGecko.data,
      geckoTerminal.data,
      dexScreener.data,
      birdeye.data,
      pumpFun.data,
    );

    return {
      tokenDetails,
      dexScreener,
      coinGecko,
      cryptoCompare,
      geckoTerminal,
      solanaTracker: { success: false, data: null, error: 'Not implemented', timestamp: new Date() },
      defiLlama,
      bitquery,
      birdeye,
      pumpFun,
      rugCheck,
      priceHistory,
    };
  }

  private buildTokenDetails(
    address: string,
    coinGeckoData?: any,
    geckoTerminalData?: any,
    dexScreenerData?: any,
    birdeyeData?: any,
    pumpFunData?: any,
  ): TokenDetails {
    return {
      address,
      name: coinGeckoData?.name || pumpFunData?.name || birdeyeData?.name || 'Unknown Token',
      symbol: coinGeckoData?.symbol?.toUpperCase() || pumpFunData?.symbol?.toUpperCase() || birdeyeData?.symbol?.toUpperCase() || 'UNKNOWN',
      decimals: 6, // Default for Solana tokens
      totalSupply: coinGeckoData?.total_supply?.toString() || pumpFunData?.totalSupply || undefined,
      marketCap: coinGeckoData?.market_cap || geckoTerminalData?.market_cap || dexScreenerData?.marketCap || birdeyeData?.marketCap || pumpFunData?.marketCap,
      price: coinGeckoData?.current_price || geckoTerminalData?.price || dexScreenerData?.price || birdeyeData?.price || pumpFunData?.price,
      priceChange24h: coinGeckoData?.price_change_percentage_24h || geckoTerminalData?.price_change_24h || dexScreenerData?.priceChange24h || birdeyeData?.priceChange24h,
      volume24h: coinGeckoData?.total_volume || geckoTerminalData?.volume_24h || dexScreenerData?.volume24h || birdeyeData?.volume24h,
      image: coinGeckoData?.image || pumpFunData?.image || birdeyeData?.image,
      description: coinGeckoData?.description?.en || pumpFunData?.description || undefined,
      website: pumpFunData?.website || undefined,
      twitter: pumpFunData?.twitter || undefined,
      telegram: pumpFunData?.telegram || undefined,
      createdAt: pumpFunData?.createdAt || undefined,
      updatedAt: new Date(),
    };
  }

  private async getAggregatedPriceHistory(tokenAddress: string): Promise<APIResponse<any[]>> {
    // Try multiple sources for price history
    const sources = [
      () => this.dexScreenerService.getPriceHistory(tokenAddress),
      () => this.coinGeckoService.getPriceHistory(tokenAddress),
      () => this.geckoTerminalService.getPriceHistory(tokenAddress),
      () => this.defiLlamaService.getPriceHistory(tokenAddress),
      () => this.birdeyeService.getPriceHistory(tokenAddress),
      () => this.pumpFunService.getPriceHistory(tokenAddress),
    ];

    for (const source of sources) {
      try {
        const result = await source();
        if (result.success && result.data && result.data.length > 0) {
          return result;
        }
      } catch (error) {
        console.error('Error fetching price history:', error);
      }
    }

    return {
      success: false,
      data: null,
      error: 'No price history available from any source',
      timestamp: new Date(),
    };
  }

  async getTokenSummary(tokenAddress: string): Promise<any> {
    const data = await this.getTokenDetails(tokenAddress);

    // Calculate success rate
    const sources = [
      data.dexScreener,
      data.coinGecko,
      data.cryptoCompare,
      data.geckoTerminal,
      data.defiLlama,
      data.bitquery,
      data.birdeye,
      data.pumpFun,
      data.rugCheck,
    ];

    const successfulSources = sources.filter(s => s.success).length;
    const totalSources = sources.length;
    const successRate = (successfulSources / totalSources) * 100;

    return {
      address: data.tokenDetails.address,
      name: data.tokenDetails.name,
      symbol: data.tokenDetails.symbol,
      price: data.tokenDetails.price,
      marketCap: data.tokenDetails.marketCap,
      volume24h: data.tokenDetails.volume24h,
      priceChange24h: data.tokenDetails.priceChange24h,
      holders: data.tokenDetails.holders,
      successRate,
      sources: {
        dexScreener: data.dexScreener.success,
        coinGecko: data.coinGecko.success,
        cryptoCompare: data.cryptoCompare.success,
        geckoTerminal: data.geckoTerminal.success,
        defiLlama: data.defiLlama.success,
        bitquery: data.bitquery.success,
        birdeye: data.birdeye.success,
        pumpFun: data.pumpFun.success,
        rugCheck: data.rugCheck.success,
      },
      security: data.rugCheck.data?.security || null,
      timestamp: new Date(),
    };
  }
}
