import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiClient } from '../utils/api-client';
import { CryptoCompareData, APIResponse } from '../types/memecoin.types';

@Injectable()
export class CryptoCompareService {
  private readonly apiKey: string | undefined;

  constructor(
    private readonly apiClient: ApiClient,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('CRYPTOCOMPARE_API_KEY');
  }

  async getTokenData(tokenSymbol: string): Promise<APIResponse<CryptoCompareData>> {
    const params: any = {
      fsym: tokenSymbol.toUpperCase(),
      tsym: 'USD',
    };

    if (this.apiKey) {
      params.api_key = this.apiKey;
    }

    const result = await this.apiClient.safeGet<any>(
      'cryptocompare',
      '/data/pricemultifull',
      params,
    );

    if (!result.success || !result.data || !result.data.RAW || !result.data.RAW[tokenSymbol.toUpperCase()]) {
      return {
        success: false,
        data: null,
        error: result.error || 'Token not found on CryptoCompare',
        timestamp: new Date(),
      };
    }

    const tokenData = result.data.RAW[tokenSymbol.toUpperCase()].USD;
    return {
      success: true,
      data: {
        PRICE: tokenData.PRICE,
        MKTCAP: tokenData.MKTCAP,
        TOTALVOLUME24HTO: tokenData.TOTALVOLUME24HTO,
        CHANGEPCT24HOUR: tokenData.CHANGEPCT24HOUR,
        HIGH24HOUR: tokenData.HIGH24HOUR,
        LOW24HOUR: tokenData.LOW24HOUR,
        SUPPLY: tokenData.SUPPLY,
      },
      timestamp: new Date(),
    };
  }

  async getPriceHistory(tokenSymbol: string, limit: number = 30): Promise<APIResponse<any[]>> {
    const params: any = {
      fsym: tokenSymbol.toUpperCase(),
      tsym: 'USD',
      limit,
    };

    if (this.apiKey) {
      params.api_key = this.apiKey;
    }

    const result = await this.apiClient.safeGet<any>(
      'cryptocompare',
      '/data/v2/histoday',
      params,
    );

    if (!result.success || !result.data || !result.data.Data || !result.data.Data.Data) {
      return {
        success: false,
        data: null,
        error: result.error || 'Price history not found',
        timestamp: new Date(),
      };
    }

    const priceHistory = result.data.Data.Data.map((item: any) => ({
      timestamp: item.time * 1000, // Convert to milliseconds
      price: item.close,
      volume: item.volumeto,
    }));

    return {
      success: true,
      data: priceHistory,
      timestamp: new Date(),
    };
  }
}
