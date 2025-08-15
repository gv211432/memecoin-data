import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiClient } from '../utils/api-client';
import { CoinGeckoData, APIResponse } from '../types/memecoin.types';

@Injectable()
export class CoinGeckoService {
  private readonly apiKey: string | undefined;

  constructor(
    private readonly apiClient: ApiClient,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('COINGECKO_API_KEY');
  }

  async getTokenData(tokenAddress: string): Promise<APIResponse<CoinGeckoData>> {
    // First, try to get token ID from contract address
    const platformId = 'solana';
    const result = await this.apiClient.safeGet<any>(
      'coingecko',
      `/coins/${platformId}/contract/${tokenAddress}`,
      this.apiKey ? { x_cg_demo_api_key: this.apiKey } : {},
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        data: null,
        error: result.error || 'Token not found on CoinGecko',
        timestamp: new Date(),
      };
    }

    const data = result.data;
    return {
      success: true,
      data: {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        image: data.image?.large || '',
        current_price: data.market_data?.current_price?.usd || 0,
        market_cap: data.market_data?.market_cap?.usd || 0,
        market_cap_rank: data.market_cap_rank,
        fully_diluted_valuation: data.market_data?.fully_diluted_valuation?.usd,
        total_volume: data.market_data?.total_volume?.usd || 0,
        high_24h: data.market_data?.high_24h?.usd || 0,
        low_24h: data.market_data?.low_24h?.usd || 0,
        price_change_24h: data.market_data?.price_change_24h || 0,
        price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
        market_cap_change_24h: data.market_data?.market_cap_change_24h || 0,
        market_cap_change_percentage_24h: data.market_data?.market_cap_change_percentage_24h || 0,
        circulating_supply: data.market_data?.circulating_supply || 0,
        total_supply: data.market_data?.total_supply || 0,
        max_supply: data.market_data?.max_supply,
        ath: data.market_data?.ath?.usd || 0,
        ath_change_percentage: data.market_data?.ath_change_percentage?.usd || 0,
        ath_date: data.market_data?.ath_date?.usd || '',
        atl: data.market_data?.atl?.usd || 0,
        atl_change_percentage: data.market_data?.atl_change_percentage?.usd || 0,
        atl_date: data.market_data?.atl_date?.usd || '',
      },
      timestamp: new Date(),
    };
  }

  async getPriceHistory(tokenAddress: string, days: number = 7): Promise<APIResponse<any[]>> {
    const platformId = 'solana';
    const result = await this.apiClient.safeGet<any>(
      'coingecko',
      `/coins/${platformId}/contract/${tokenAddress}/market_chart`,
      {
        days,
        vs_currency: 'usd',
        ...(this.apiKey ? { x_cg_demo_api_key: this.apiKey } : {}),
      },
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        data: null,
        error: result.error || 'Price history not found',
        timestamp: new Date(),
      };
    }

    const prices = result.data.prices || [];
    const volumes = result.data.total_volumes || [];
    
    const priceHistory = prices.map((price: any[], index: number) => ({
      timestamp: price[0],
      price: price[1],
      volume: volumes[index] ? volumes[index][1] : 0,
    }));

    return {
      success: true,
      data: priceHistory,
      timestamp: new Date(),
    };
  }
}
