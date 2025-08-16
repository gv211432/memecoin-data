export interface BirdeyeTokenData {
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

export interface BirdeyePriceHistory {
  data: {
    items: Array<{
      unixTime: number;
      value: number;
      volume: number;
    }>;
  };
  success: boolean;
}
