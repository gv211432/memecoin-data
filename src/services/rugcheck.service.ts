import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { APIResponse } from '../types/memecoin.types';

interface RugCheckReport {
  token: string;
  score: number;
  risks: Array<{
    name: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
  markets: Array<{
    marketId: string;
    score: number;
    risks: Array<{
      name: string;
      level: string;
      description: string;
    }>;
  }>;
  totalRisk: number;
  totalRisks: number;
}

interface RugCheckTokenInfo {
  mint: string;
  owner: string;
  ownerBalance: number;
  decimals: number;
  supply: string;
  isMutable: boolean;
  updateAuthority: string;
  freezeAuthority: string;
  name: string;
  symbol: string;
  uri: string;
}

@Injectable()
export class RugCheckService {
  private readonly baseUrl = 'https://api.rugcheck.xyz';

  async getTokenReport(tokenAddress: string): Promise<APIResponse<any>> {
    try {
      const response = await axios.get<RugCheckReport>(
        `${this.baseUrl}/v1/tokens/${tokenAddress}/report`,
        { timeout: 10000 }
      );

      if (!response.data) {
        return {
          success: false,
          data: null,
          error: 'No data received from RugCheck',
          timestamp: new Date(),
        };
      }

      const data = response.data;
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
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<APIResponse<any>> {
    try {
      const response = await axios.get<RugCheckTokenInfo>(
        `${this.baseUrl}/v1/tokens/${tokenAddress}`,
        { timeout: 10000 }
      );

      if (!response.data) {
        return {
          success: false,
          data: null,
          error: 'No token info received from RugCheck',
          timestamp: new Date(),
        };
      }

      const data = response.data;
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
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async getTokenSummary(tokenAddress: string): Promise<APIResponse<any>> {
    try {
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
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async getRecentTokens(limit: number = 20): Promise<APIResponse<any[]>> {
    try {
      const response = await axios.get<any[]>(
        `${this.baseUrl}/v1/tokens/recent?limit=${limit}`,
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

  async getRiskCategories(): Promise<APIResponse<any[]>> {
    try {
      const response = await axios.get<any[]>(
        `${this.baseUrl}/v1/risk-categories`,
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
