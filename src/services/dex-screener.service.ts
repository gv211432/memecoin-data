import { Injectable } from '@nestjs/common';
import { ApiClient } from '../utils/api-client';
import { DexScreenerData, APIResponse } from '../types/memecoin.types';

@Injectable()
export class DexScreenerService {
  constructor(private readonly apiClient: ApiClient) {}

  async getTokenData(tokenAddress: string): Promise<APIResponse<DexScreenerData>> {
    const result = await this.apiClient.safeGet<any>(
      'dexscreener',
      `/latest/dex/tokens/${tokenAddress}`,
    );

    if (!result.success || !result.data || !result.data.pairs || result.data.pairs.length === 0) {
      return {
        success: false,
        data: null,
        error: result.error || 'No data found',
        timestamp: new Date(),
      };
    }

    const pair = result.data.pairs[0];
    return {
      success: true,
      data: {
        price: parseFloat(pair.priceUsd),
        priceChange5m: pair.priceChange?.m5 ? parseFloat(pair.priceChange.m5) : undefined,
        priceChange1h: pair.priceChange?.h1 ? parseFloat(pair.priceChange.h1) : undefined,
        priceChange6h: pair.priceChange?.h6 ? parseFloat(pair.priceChange.h6) : undefined,
        priceChange24h: pair.priceChange?.h24 ? parseFloat(pair.priceChange.h24) : undefined,
        volume24h: pair.volume?.h24 ? parseFloat(pair.volume.h24) : undefined,
        marketCap: pair.marketCap ? parseFloat(pair.marketCap) : undefined,
        liquidity: pair.liquidity?.usd ? parseFloat(pair.liquidity.usd) : undefined,
        pairAddress: pair.pairAddress,
      },
      timestamp: new Date(),
    };
  }

  async getPriceHistory(tokenAddress: string, timeframe: string = '1D'): Promise<APIResponse<any[]>> {
    const result = await this.apiClient.safeGet<any>(
      'dexscreener',
      `/latest/dex/tokens/${tokenAddress}`,
    );

    if (!result.success || !result.data || !result.data.pairs || result.data.pairs.length === 0) {
      return {
        success: false,
        data: null,
        error: result.error || 'No data found',
        timestamp: new Date(),
      };
    }

    const pair = result.data.pairs[0];
    return {
      success: true,
      data: pair.priceHistory || [],
      timestamp: new Date(),
    };
  }
}
