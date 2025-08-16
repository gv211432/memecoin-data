import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiClient {
  private clients: Map<string, AxiosInstance> = new Map();

  constructor() {
    // Initialize clients for different APIs
    this.createClient('dexscreener', 'https://api.dexscreener.com');
    this.createClient('coingecko', 'https://api.coingecko.com/api/v3');
    this.createClient('cryptocompare', 'https://min-api.cryptocompare.com');
    this.createClient('geckoterminal', 'https://api.geckoterminal.com/api/v2');
    this.createClient('defillama', 'https://coins.llama.fi');
    this.createClient('bitquery', 'https://streaming.bitquery.io/graphql');
    this.createClient('birdeye', 'https://public-api.birdeye.so');
    this.createClient('pumpfun', 'https://frontend-api.pump.fun');
    this.createClient('rugcheck', 'https://api.rugcheck.xyz');
  }

  private createClient(name: string, baseURL: string): void {
    const client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'User-Agent': 'Solana-Memecoin-API/1.0',
      },
    });

    // Add request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        console.log(`[${name}] Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error(`[${name}] Request error:`, error.message);
        return Promise.reject(error);
      },
    );

    // Add response interceptor for error handling
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(`[${name}] Response error:`, error.response?.status, error.message);
        return Promise.reject(error);
      },
    );

    this.clients.set(name, client);
  }

  async get<T>(clientName: string, endpoint: string, params?: any): Promise<T> {
    const client = this.clients.get(clientName);
    if (!client) {
      throw new Error(`Client ${clientName} not found`);
    }

    const response: AxiosResponse<T> = await client.get(endpoint, { params });
    return response.data;
  }

  async post<T>(clientName: string, endpoint: string, data?: any): Promise<T> {
    const client = this.clients.get(clientName);
    if (!client) {
      throw new Error(`Client ${clientName} not found`);
    }

    const response: AxiosResponse<T> = await client.post(endpoint, data);
    return response.data;
  }

  async safeGet<T>(
    clientName: string,
    endpoint: string,
    params?: any,
  ): Promise<{ success: boolean; data: T | null; error?: string }> {
    try {
      const data = await this.get<T>(clientName, endpoint, params);
      return { success: true, data };
    } catch (error) {
      console.error(`[${clientName}] Error fetching ${endpoint}:`, error.message);
      return {
        success: false,
        data: null,
        error: error.message || 'Unknown error',
      };
    }
  }

  async safePost<T>(
    clientName: string,
    endpoint: string,
    data?: any,
  ): Promise<{ success: boolean; data: T | null; error?: string }> {
    try {
      const result = await this.post<T>(clientName, endpoint, data);
      return { success: true, data: result };
    } catch (error) {
      console.error(`[${clientName}] Error posting to ${endpoint}:`, error.message);
      return {
        success: false,
        data: null,
        error: error.message || 'Unknown error',
      };
    }
  }
}
