import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { MemecoinService } from '../services/memecoin.service';
import { TokenRequestDto } from '../dto/token-request.dto';

@Controller('memecoin')
export class MemecoinController {
  constructor(private readonly memecoinService: MemecoinService) {}

  @Get('details')
  async getTokenDetails(@Query('address') address: string): Promise<any> {
    if (!address) {
      throw new HttpException('Token address is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const data = await this.memecoinService.getTokenDetails(address);
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch token details: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('details')
  async getTokenDetailsPost(@Body() tokenRequest: TokenRequestDto): Promise<any> {
    try {
      const data = await this.memecoinService.getTokenDetails(tokenRequest.address);
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch token details: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('summary')
  async getTokenSummary(@Query('address') address: string): Promise<any> {
    if (!address) {
      throw new HttpException('Token address is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const data = await this.memecoinService.getTokenSummary(address);
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch token summary: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  async healthCheck(): Promise<any> {
    return {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
      endpoints: [
        'GET /api/memecoin/details?address={token_address}',
        'POST /api/memecoin/details',
        'GET /api/memecoin/summary?address={token_address}',
        'GET /api/memecoin/health',
      ],
    };
  }
}
