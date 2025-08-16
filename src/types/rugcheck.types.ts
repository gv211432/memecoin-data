
export interface RugCheckReport {
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

export interface RugCheckTokenInfo {
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
