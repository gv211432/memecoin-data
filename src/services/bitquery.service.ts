import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiClient } from '../utils/api-client';
import { BitqueryData, APIResponse } from '../types/memecoin.types';

@Injectable()
export class BitqueryService {
  private readonly apiKey: string | undefined;

  constructor(
    private readonly apiClient: ApiClient,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('BITQUERY_API_KEY');
  }

  async getTokenData(tokenAddress: string): Promise<APIResponse<BitqueryData>> {
    const query = `
      query ($token: String!) {
        solana(network: {solana}) {
          dexTrades(
            baseCurrency: {is: $token}
            options: {limit: 1, desc: "block.height"}
          ) {
            block {
              timestamp {
                unixtime
              }
            }
            baseCurrency {
              symbol
              name
              decimals
            }
            quotePrice
            tradeAmount(in: USD)
          }
          trades24h: dexTrades(
            baseCurrency: {is: $token}
            time: {since: "2024-08-14T00:00:00Z"}
          ) {
            count
            tradeAmount(in: USD)
            uniqueSenders: count(uniq: senders)
          }
        }
      }
    `;

    const variables = { token: tokenAddress };

    const headers = this.apiKey ? { 'X-API-KEY': this.apiKey } : {};

    const result = await this.apiClient.safePost<any>(
      'bitquery',
      '',
      { query, variables },
    );

    if (!result.success || !result.data || !result.data.data || !result.data.data.solana) {
      return {
        success: false,
        data: null,
        error: result.error || 'Token not found on Bitquery',
        timestamp: new Date(),
      };
    }

    const solanaData = result.data.data.solana;
    const latestTrade = solanaData.dexTrades[0];
    const trades24h = solanaData.trades24h[0];

    return {
      success: true,
      data: {
        price: latestTrade?.quotePrice || 0,
        volume24h: trades24h?.tradeAmount || 0,
        trades24h: trades24h?.count || 0,
        uniqueTraders24h: trades24h?.uniqueSenders || 0,
      },
      timestamp: new Date(),
    };
  }

  async getPriceHistory(tokenAddress: string, limit: number = 100): Promise<APIResponse<any[]>> {
    const query = `
      query ($token: String!, $limit: Int!) {
        solana(network: {solana}) {
          dexTrades(
            baseCurrency: {is: $token}
            options: {limit: $limit, desc: "block.height"}
          ) {
            block {
              timestamp {
                unixtime
              }
            }
            quotePrice
            tradeAmount(in: USD)
          }
        }
      }
    `;

    const variables = { token: tokenAddress, limit };

    const result = await this.apiClient.safePost<any>(
      'bitquery',
      '',
      { query, variables },
    );

    if (!result.success || !result.data || !result.data.data || !result.data.data.solana) {
      return {
        success: false,
        data: null,
        error: result.error || 'Price history not found',
        timestamp: new Date(),
      };
    }

    const trades = result.data.data.solana.dexTrades || [];
    const priceHistory = trades.map((trade: any) => ({
      timestamp: trade.block.timestamp.unixtime * 1000, // Convert to milliseconds
      price: trade.quotePrice,
      volume: trade.tradeAmount,
    }));

    return {
      success: true,
      data: priceHistory,
      timestamp: new Date(),
    };
  }
}
