import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { APIResponse } from '../types/memecoin.types';

interface PumpFunTokenData {
  mint: string;
  symbol: string;
  name: string;
  description: string;
  image_uri: string;
  metadata_uri: string;
  twitter: string;
  telegram: string;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  created_timestamp: number;
  raydium_pool: string | null;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: string;
  website: string;
  show_name: boolean;
  king_of_the_hill_timestamp: number | null;
  market_cap: number;
  reply_count: number;
  last_reply: number;
  nsfw: boolean;
  market_id: string | null;
  inverted: boolean;
  is_currently_live: boolean;
  username: string;
  profile_image: string;
  usd_market_cap: number;
}

interface PumpFunPriceHistory {
  timestamp: number;
  price: number;
  volume: number;
}

@Injectable()
export class PumpFunService {
  private readonly baseUrl = 'https://frontend-api.pump.fun';

  async getTokenData(tokenAddress: string): Promise<APIResponse<any>> {
    try {
      const response = await axios.get<PumpFunTokenData>(
        `${this.baseUrl}/coins/${tokenAddress}`,
        { timeout: 10000 }
      );

      if (!response.data) {
        return {
          success: false,
          data: null,
          error: 'No data received from Pump.fun',
          timestamp: new Date(),
        };
      }

      const data = response.data;
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
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async getPriceHistory(tokenAddress: string, limit: number = 100): Promise<APIResponse<any[]>> {
    try {
      const response = await axios.get<PumpFunPriceHistory[]>(
        `${this.baseUrl}/coins/${tokenAddress}/price_history?limit=${limit}`,
        { timeout: 10000 }
      );

      if (!response.data || !Array.isArray(response.data)) {
        return {
          success: false,
          data: null,
          error: 'No price history data available',
          timestamp: new Date(),
        };
      }

      const priceHistory = response.data.map(item => ({
        timestamp: item.timestamp,
        price: item.price,
        volume: item.volume || 0,
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

  async getTokenReplies(tokenAddress: string, limit: number = 50): Promise<APIResponse<any[]>> {
    try {
      const response = await axios.get<any[]>(
        `${this.baseUrl}/coins/${tokenAddress}/replies?limit=${limit}`,
        { timeout: 10000 }
      );

      return {
        success: true,
        data: response.data || [],
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

  async getTrendingTokens(limit: number = 10): Promise<APIResponse<any[]>> {
    try {
      const response = await axios.get<any[]>(
        `${this.baseUrl}/coins/trending?limit=${limit}&offset=0`,
        { timeout: 10000 }
      );

      return {
        success: true,
        data: response.data || [],
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
