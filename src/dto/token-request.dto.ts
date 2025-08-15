import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class TokenRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, {
    message: 'Invalid Solana address format',
  })
  address: string;
}

export class TokenResponseDto {
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
  dexScreener?: any;
  coinGecko?: any;
  cryptoCompare?: any;
  geckoTerminal?: any;
  solanaTracker?: any;
  defiLlama?: any;
  bitquery?: any;
  priceHistory?: any;
  timestamp: Date;
}
