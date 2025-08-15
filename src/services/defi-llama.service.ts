import { Injectable } from '@nestjs/common';
import { ApiClient } from '../utils/api-client';
import { DeFiLlamaData, APIResponse } from '../types/memecoin.types';

@Injectable()
export class DeFiLlamaService {
  constructor(private readonly apiClient: ApiClient) {}

  async getTokenData(tokenAddress: string): Promise<APIResponse<DeFiLlamaData>> {
    const result = await this.apiClient.safeGet<any>(
      'defillama',
      `/prices/current/solana:${tokenAddress}`,
    );

    if (!result.success || !result.data || !result.data.coins || !result.data.coins[`solana:${tokenAddress}`]) {
      return {
        success: false,
        data: null,
        error: result.error || 'Token not found on DeFi Llama',
        timestamp: new Date(),
      };
    }

    const tokenData = result.data.coins[`solana:${tokenAddress}`];
    return {
      success: true,
      data: {
        price: tokenData.price || 0,
        marketCap: tokenData.marketCap || 0,
        volume24h: tokenData.volume24h || 0,
        priceChange24h: tokenData.priceChange24h || 0,
      },
      timestamp: new Date(),
    };
  }

  async getPriceHistory(tokenAddress: string, span: number = 7): Promise<APIResponse<any[]>> {
    const result = await this.apiClient.safeGet<any>(
      'defillama',
      `/prices/historical/solana:${tokenAddress}`,
      { span },
    );

    if (!result.success || !result.data || !result.data.coins || !result.data.coins[`solana:${tokenAddress}`]) {
      return {
        success: false,
        data: null,
        error: result.error || 'Price history not found',
        timestamp: new Date(),
      };
    }

    const tokenData = result.data.coins[`solana:${tokenAddress}`];
    const priceHistory = tokenData.prices || [];

    return {
      success: true,
      data: priceHistory.map((item: any) => ({
        timestamp: item.timestamp * 1000, // Convert to milliseconds
        price: item.price,
      })),
      timestamp: new Date(),
    };
  }
}
