import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { APIResponse } from '../types/memecoin.types';

interface BirdeyeTokenData {
  data: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    price: number;
    price_change_24h: number;
    volume_24h: number;
    market_cap: number;
    liquidity: number;
    last_trade_unix_time: number;
    image_uri?: string;
  };
  success: boolean;
}

interface BirdeyePriceHistory {
  data: {
    items: Array<{
      unixTime: number;
      value: number;
      volume: number;
    }>;
  };
  success: boolean;
}

@Injectable()
export class BirdeyeService {
  private readonly baseUrl = 'https://public-api.birdeye.so';
  private readonly apiKey: string | undefined;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BIRDEYE_API_KEY');
  }

  async getTokenData(tokenAddress: string): Promise<APIResponse<any>> {
    try {
      const headers = this.apiKey ? { 'X-API-KEY': this.apiKey } : {};
      
      const response = await axios.get<BirdeyeTokenData>(
        `${this.baseUrl}/defi/token_overview?address=${tokenAddress}`,
        { headers, timeout: 10000 }
      );

      if (!response.data?.success || !response.data.data) {
        return {
          success: false,
          data: null,
          error: 'No data received from Birdeye',
          timestamp: new Date(),
        };
      }

      const data = response.data.data;
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
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async getPriceHistory(tokenAddress: string, days: number = 7): Promise<APIResponse<any[]>> {
    try {
      const headers = this.apiKey ? { 'X-API-KEY': this.apiKey } : {};
      const timeFrom = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
      
      const response = await axios.get<BirdeyePriceHistory>(
        `${this.baseUrl}/defi/history_price?address=${tokenAddress}&type=1D&time_from=${timeFrom}`,
        { headers, timeout: 10000 }
      );

      if (!response.data?.success || !response.data.data?.items) {
        return {
          success: false,
          data: null,
          error: 'No price history data available',
          timestamp: new Date(),
        };
      }

      const priceHistory = response.data.data.items.map(item => ({
        timestamp: item.unixTime * 1000,
        price: item.value,
        volume: item.volume,
      }));

      return {
        success: true,
        data: priceHistory,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async getTokenSecurity(tokenAddress: string): Promise<APIResponse<any>> {
    try {
      const headers = this.apiKey ? { 'X-API-KEY': this.apiKey } : {};
      
      const response = await axios.get<any>(
        `${this.baseUrl}/defi/token_security?address=${tokenAddress}`,
        { headers, timeout: 10000 }
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
}
