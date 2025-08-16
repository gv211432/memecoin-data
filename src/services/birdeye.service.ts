import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiClient } from '../utils/api-client';
import { APIResponse } from '../types/memecoin.types';
import { BirdeyePriceHistory, BirdeyeTokenData } from '../types/birdeye.types';

@Injectable()
export class BirdeyeService {
  private readonly apiKey: string | undefined;

  constructor(
    private readonly apiClient: ApiClient,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('BIRDEYE_API_KEY');
  }

  async getTokenData(tokenAddress: string): Promise<APIResponse<any>> {
    const headers = this.apiKey ? { 'X-API-KEY': this.apiKey } : {};

    const result = await this.apiClient.safeGet<BirdeyeTokenData>(
      'birdeye',
      `/defi/token_overview`,
      { address: tokenAddress, ...headers }
    );

    if (!result.success || !result.data || !result.data.data) {
      return {
        success: false,
        data: null,
        error: result.error || 'No data received from Birdeye',
        timestamp: new Date(),
      };
    }

    const data = result.data.data;
    return {
      success: true,
      data: {
        price: data.price,
        priceChange24h: data.price_change_24h,
        volume24h: data.volume_24h,
        marketCap: data.market_cap,
        liquidity: data.liquidity,
        symbol: data.symbol,
        name: data.name,
        image: data.image_uri,
      },
      timestamp: new Date(),
    };
  }

  async getPriceHistory(tokenAddress: string, days: number = 7): Promise<APIResponse<any[]>> {
    const timeFrom = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    const headers = this.apiKey ? { 'X-API-KEY': this.apiKey } : {};

    const result = await this.apiClient.safeGet<BirdeyePriceHistory>(
      'birdeye',
      `/defi/history_price`,
      {
        address: tokenAddress,
        type: '1D',
        time_from: timeFrom,
        ...headers
      }
    );

    if (!result.success || !result.data || !result.data.data?.items) {
      return {
        success: false,
        data: null,
        error: result.error || 'No price history data available',
        timestamp: new Date(),
      };
    }

    const priceHistory = result.data.data.items.map(item => ({
      timestamp: item.unixTime * 1000,
      price: item.value,
      volume: item.volume,
    }));

    return {
      success: true,
      data: priceHistory,
      timestamp: new Date(),
    };
  }

  async getTokenSecurity(tokenAddress: string): Promise<APIResponse<any>> {
    const headers = this.apiKey ? { 'X-API-KEY': this.apiKey } : {};

    const result = await this.apiClient.safeGet<any>(
      'birdeye',
      `/defi/token_security`,
      { address: tokenAddress, ...headers }
    );

    if (!result.success) {
      return {
        success: false,
        data: null,
        error: result.error || 'Failed to get token security data',
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: result.data,
      timestamp: new Date(),
    };
  }
}
