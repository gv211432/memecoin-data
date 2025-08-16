import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MemecoinController } from './controllers/memecoin.controller';
import { MemecoinService } from './services/memecoin.service';
import { DexScreenerService } from './services/dex-screener.service';
import { CoinGeckoService } from './services/coin-gecko.service';
import { CryptoCompareService } from './services/crypto-compare.service';
import { GeckoTerminalService } from './services/gecko-terminal.service';
import { DeFiLlamaService } from './services/defi-llama.service';
import { BitqueryService } from './services/bitquery.service';
import { BirdeyeService } from './services/birdeye.service';
import { PumpFunService } from './services/pump-fun.service';
import { RugCheckService } from './services/rugcheck.service';
import { ApiClient } from './utils/api-client';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  controllers: [MemecoinController],
  providers: [
    MemecoinService,
    DexScreenerService,
    CoinGeckoService,
    CryptoCompareService,
    GeckoTerminalService,
    DeFiLlamaService,
    BitqueryService,
    BirdeyeService,
    PumpFunService,
    RugCheckService,
    ApiClient,
  ],
})
export class AppModule {}
