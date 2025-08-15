import { Injectable } from '@nestjs/common';
import { ApiClient } from '../utils/api-client';
import { GeckoTerminalData, APIResponse } from '../types/memecoin.types';

@Injectable()
export class GeckoTerminalService {
  constructor(private readonly apiClient: ApiClient) {}

  async getTokenData(tokenAddress: string): Promise<APIResponse<GeckoTerminalData>> {
    const result = await this.apiClient.safeGet<any>(
      'geckoterminal',
      `/networks/solana/tokens/${tokenAddress}`,
    );

    if (!result.success || !result.data || !result.data.data) {
      return {
        success: false,
        data: null,
        error: result.error || 'Token not found on GeckoTerminal',
        timestamp: new Date(),
      };
    }

    const attributes = result.data.data.attributes;
    return {
      success: true,
      data: {
        price: parseFloat(attributes.price_usd),
        price_change_24h: parseFloat(attributes.price_change_percentage?.h24 || 0),
        volume_24h: parseFloat(attributes.volume_usd?.h24 || 0),
        market_cap: parseFloat(attributes.market_cap_usd || 0),
        fdv: parseFloat(attributes.fdv_usd || 0),
      },
      timestamp: new Date(),
    };
  }

  async getPriceHistory(tokenAddress: string, timeframe: string = 'day'): Promise<APIResponse<any[]>> {
    const result = await this.apiClient.safeGet<any>(
      'geckoterminal',
      `/networks/solana/tokens/${tokenAddress}/ohlcv/${timeframe}`,
    );

    if (!result.success || !result.data || !result.data.data) {
      return {
        success: false,
        data: null,
        error: result.error || 'Price history not found',
        timestamp: new Date(),
      };
    }

    const ohlcv = result.data.data.attributes.ohlcv_list || [];
    const priceHistory = ohlcv.map((item: any[]) => ({
      timestamp: item[0] * 1000, // Convert to milliseconds
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: item[5],
    }));

    return {
      success: true,
      data: priceHistory,
      timestamp: new Date(),
    };
  }
}
