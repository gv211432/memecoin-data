import { Injectable } from '@nestjs/common';
import { ApiClient } from '../utils/api-client';
import { APIResponse } from '../types/memecoin.types';
import { PumpFunPriceHistory, PumpFunTokenData } from '../types/pump-fun.types';

@Injectable()
export class PumpFunService {
  constructor(private readonly apiClient: ApiClient) { }

  async getTokenData(tokenAddress: string): Promise<APIResponse<any>> {
    const result = await this.apiClient.safeGet<PumpFunTokenData>(
      'pumpfun',
      `/coins/${tokenAddress}`
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        data: null,
        error: result.error || 'No data received from Pump.fun',
        timestamp: new Date(),
      };
    }

    const data = result.data;
    return {
      success: true,
      data: {
        price: data.usd_market_cap / parseFloat(data.total_supply),
        marketCap: data.usd_market_cap,
        volume24h: 0, // Not directly provided, would need separate endpoint
        symbol: data.symbol,
        name: data.name,
        image: data.image_uri,
        description: data.description,
        website: data.website,
        twitter: data.twitter,
        telegram: data.telegram,
        totalSupply: data.total_supply,
        bondingCurve: data.bonding_curve,
        creator: data.creator,
        createdAt: new Date(data.created_timestamp),
        isComplete: data.complete,
        hasRaydiumPool: !!data.raydium_pool,
        marketId: data.market_id,
        replyCount: data.reply_count,
        isNsfw: data.nsfw,
        isLive: data.is_currently_live,
      },
      timestamp: new Date(),
    };
  }

  async getPriceHistory(tokenAddress: string, limit: number = 100): Promise<APIResponse<any[]>> {
    const result = await this.apiClient.safeGet<PumpFunPriceHistory[]>(
      'pumpfun',
      `/coins/${tokenAddress}/price_history`,
      { limit }
    );

    if (!result.success || !result.data || !Array.isArray(result.data)) {
      return {
        success: false,
        data: null,
        error: result.error || 'No price history data available',
        timestamp: new Date(),
      };
    }

    const priceHistory = result.data.map(item => ({
      timestamp: item.timestamp,
      price: item.price,
      volume: item.volume || 0,
    }));

    return {
      success: true,
      data: priceHistory,
      timestamp: new Date(),
    };
  }

  async getTokenReplies(tokenAddress: string, limit: number = 50): Promise<APIResponse<any[]>> {
    const result = await this.apiClient.safeGet<any[]>(
      'pumpfun',
      `/coins/${tokenAddress}/replies`,
      { limit }
    );

    if (!result.success) {
      return {
        success: false,
        data: null,
        error: result.error || 'Failed to get token replies',
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: result.data || [],
      timestamp: new Date(),
    };
  }

  async getTrendingTokens(limit: number = 10): Promise<APIResponse<any[]>> {
    const result = await this.apiClient.safeGet<any[]>(
      'pumpfun',
      `/coins/trending`,
      { limit, offset: 0 }
    );

    if (!result.success) {
      return {
        success: false,
        data: null,
        error: result.error || 'Failed to get trending tokens',
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: result.data || [],
      timestamp: new Date(),
    };
  }
}
