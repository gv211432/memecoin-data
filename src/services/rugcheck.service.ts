import { Injectable } from '@nestjs/common';
import { ApiClient } from '../utils/api-client';
import { APIResponse } from '../types/memecoin.types';
import { RugCheckReport, RugCheckTokenInfo } from '../types/rugcheck.types';

@Injectable()
export class RugCheckService {
  constructor(private readonly apiClient: ApiClient) { }

  async getTokenReport(tokenAddress: string): Promise<APIResponse<any>> {
    const result = await this.apiClient.safeGet<RugCheckReport>(
      'rugcheck',
      `/v1/tokens/${tokenAddress}/report`
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        data: null,
        error: result.error || 'No data received from RugCheck',
        timestamp: new Date(),
      };
    }

    const data = result.data;
    return {
      success: true,
      data: {
        score: data.score,
        totalRisk: data.totalRisk,
        totalRisks: data.totalRisks,
        risks: data.risks,
        markets: data.markets,
        isHighRisk: data.score < 50,
        isMediumRisk: data.score >= 50 && data.score < 75,
        isLowRisk: data.score >= 75,
      },
      timestamp: new Date(),
    };
  }

  async getTokenInfo(tokenAddress: string): Promise<APIResponse<any>> {
    const result = await this.apiClient.safeGet<RugCheckTokenInfo>(
      'rugcheck',
      `/v1/tokens/${tokenAddress}`
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        data: null,
        error: result.error || 'No token info received from RugCheck',
        timestamp: new Date(),
      };
    }

    const data = result.data;
    return {
      success: true,
      data: {
        mint: data.mint,
        owner: data.owner,
        ownerBalance: data.ownerBalance,
        decimals: data.decimals,
        supply: data.supply,
        isMutable: data.isMutable,
        updateAuthority: data.updateAuthority,
        freezeAuthority: data.freezeAuthority,
        name: data.name,
        symbol: data.symbol,
        uri: data.uri,
      },
      timestamp: new Date(),
    };
  }

  async getTokenSummary(tokenAddress: string): Promise<APIResponse<any>> {
    // Get both report and info in parallel
    const [report, info] = await Promise.all([
      this.getTokenReport(tokenAddress),
      this.getTokenInfo(tokenAddress),
    ]);

    if (!report.success || !info.success) {
      return {
        success: false,
        data: null,
        error: 'Failed to get complete token summary',
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: {
        security: report.data,
        tokenInfo: info.data,
      },
      timestamp: new Date(),
    };
  }

  async getRecentTokens(limit: number = 20): Promise<APIResponse<any[]>> {
    const result = await this.apiClient.safeGet<any[]>(
      'rugcheck',
      `/v1/tokens/recent`,
      { limit }
    );

    if (!result.success) {
      return {
        success: false,
        data: null,
        error: result.error || 'Failed to get recent tokens',
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: result.data || [],
      timestamp: new Date(),
    };
  }

  async getRiskCategories(): Promise<APIResponse<any[]>> {
    const result = await this.apiClient.safeGet<any[]>(
      'rugcheck',
      `/v1/risk-categories`
    );

    if (!result.success) {
      return {
        success: false,
        data: null,
        error: result.error || 'Failed to get risk categories',
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
