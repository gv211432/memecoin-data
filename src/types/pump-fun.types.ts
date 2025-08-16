
export interface PumpFunTokenData {
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

export interface PumpFunPriceHistory {
  timestamp: number;
  price: number;
  volume: number;
}