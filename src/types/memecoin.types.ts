export interface TokenDetails {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: string;
  marketCap?: number;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  holders?: number;
  description?: string;
  image?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
  volume?: number;
  marketCap?: number;
}

export interface DexScreenerData {
  price: number;
  priceChange5m?: number;
  priceChange1h?: number;
  priceChange6h?: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  liquidity?: number;
  pairAddress?: string;
}

export interface CoinGeckoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank?: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
}

export interface CryptoCompareData {
  PRICE: number;
  MKTCAP: number;
  TOTALVOLUME24HTO: number;
  CHANGEPCT24HOUR: number;
  HIGH24HOUR: number;
  LOW24HOUR: number;
  SUPPLY: number;
}

export interface GeckoTerminalData {
  price: number;
  price_change_24h: number;
  volume_24h: number;
  market_cap: number;
  fdv: number;
}

export interface SolanaTrackerData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  holders: number;
  ath: number;
  atl: number;
}

export interface DeFiLlamaData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
}

export interface BitqueryData {
  price: number;
  volume24h: number;
  trades24h: number;
  uniqueTraders24h: number;
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  timestamp: Date;
}

export interface MemecoinAggregateData {
  tokenDetails: TokenDetails;
  dexScreener: APIResponse<DexScreenerData>;
  coinGecko: APIResponse<CoinGeckoData>;
  cryptoCompare: APIResponse<CryptoCompareData>;
  geckoTerminal: APIResponse<GeckoTerminalData>;
  solanaTracker: APIResponse<SolanaTrackerData>;
  defiLlama: APIResponse<DeFiLlamaData>;
  bitquery: APIResponse<BitqueryData>;
  priceHistory: APIResponse<PriceHistory[]>;
}
