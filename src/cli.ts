#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { ConfigService } from '@nestjs/config';
import { BirdeyeService } from './services/birdeye.service';
import { BitqueryService } from './services/bitquery.service';
import { CoinGeckoService } from './services/coin-gecko.service';
import { CryptoCompareService } from './services/crypto-compare.service';
import { DeFiLlamaService } from './services/defi-llama.service';
import { DexScreenerService } from './services/dex-screener.service';
import { GeckoTerminalService } from './services/gecko-terminal.service';
import { MemecoinService } from './services/memecoin.service';
import { PumpFunService } from './services/pump-fun.service';
import { RugCheckService } from './services/rugcheck.service';
import { ApiClient } from './utils/api-client';

// Load environment variables
dotenv.config({ path: ['.env.local', '.env'] });

interface ServiceInfo {
  name: string;
  instance: any;
  methods: string[];
}

interface ServiceMethod {
  name: string;
  value: string;
}

class InteractiveCLI {
  private services: ServiceInfo[] = [];
  private apiClient: ApiClient;
  private configService: ConfigService;

  constructor() {
    // Create manual instances
    this.apiClient = new ApiClient();
    this.configService = new ConfigService();
    this.loadServices();
  }

  private loadServices(): void {
    console.log(chalk.blue('🔄 Loading services...'));

    const serviceMap = [
      { name: 'birdeye', service: new BirdeyeService(this.apiClient, this.configService) },
      { name: 'bitquery', service: new BitqueryService(this.apiClient, this.configService) },
      { name: 'coin-gecko', service: new CoinGeckoService(this.apiClient, this.configService) },
      { name: 'crypto-compare', service: new CryptoCompareService(this.apiClient, this.configService) },
      { name: 'defi-llama', service: new DeFiLlamaService(this.apiClient) },
      { name: 'dex-screener', service: new DexScreenerService(this.apiClient) },
      { name: 'gecko-terminal', service: new GeckoTerminalService(this.apiClient) },
      {
        name: 'memecoin', service: new MemecoinService(
          new DexScreenerService(this.apiClient),
          new CoinGeckoService(this.apiClient, this.configService),
          new CryptoCompareService(this.apiClient, this.configService),
          new GeckoTerminalService(this.apiClient),
          new DeFiLlamaService(this.apiClient),
          new BitqueryService(this.apiClient, this.configService),
          new BirdeyeService(this.apiClient, this.configService),
          new PumpFunService(this.apiClient),
          new RugCheckService(this.apiClient)
        )
      },
      { name: 'pump-fun', service: new PumpFunService(this.apiClient) },
      { name: 'rugcheck', service: new RugCheckService(this.apiClient) },
    ];

    for (const { name, service } of serviceMap) {
      try {
        const methods = this.getServiceMethods(service);
        this.services.push({
          name,
          instance: service,
          methods
        });
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Failed to load ${name}: ${error instanceof Error ? error.message : error}`));
      }
    }

    if (this.services.length === 0) {
      console.error(chalk.red('❌ No services could be loaded'));
      process.exit(1);
    }

    console.log(chalk.green(`✅ Loaded ${this.services.length} services`));
  }

  private getServiceMethods(instance: any): string[] {
    const methods: string[] = [];
    const proto = Object.getPrototypeOf(instance);

    Object.getOwnPropertyNames(proto).forEach(name => {
      if (typeof proto[name] === 'function' &&
        !name.startsWith('_') &&
        name !== 'constructor') {
        methods.push(name);
      }
    });

    return methods.sort();
  }

  private async selectService(): Promise<ServiceInfo | null> {
    const choices = this.services.map(service => ({
      name: `${chalk.cyan(service.name)} ${chalk.gray(`(${service.methods.length} methods)`)}`,
      value: service
    }));

    const { selectedService } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedService',
        message: chalk.yellow('Select a service:'),
        choices: [
          ...choices,
          new inquirer.Separator(),
          { name: chalk.red('Exit'), value: null }
        ],
        pageSize: 15
      }
    ]);

    return selectedService;
  }

  private async selectMethod(service: ServiceInfo): Promise<string | null> {
    if (service.methods.length === 0) {
      console.log(chalk.red('No methods found for this service.'));
      return null;
    }

    const choices = service.methods.map(method => ({
      name: chalk.green(method),
      value: method
    }));

    const { selectedMethod } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedMethod',
        message: chalk.yellow(`Select a method for ${service.name}:`),
        choices: [
          ...choices,
          new inquirer.Separator(),
          { name: chalk.red('Back'), value: null }
        ],
        default: choices[0]?.value,
        pageSize: 10
      }
    ]);

    return selectedMethod;
  }

  private async getTokenAddress(): Promise<string> {
    const { tokenAddress } = await inquirer.prompt([
      {
        type: 'input',
        name: 'tokenAddress',
        message: chalk.yellow('Enter token address (leave empty for USD):'),
        default: 'USD',
        validate: (input) => {
          if (!input || input.trim() === '' || input.toUpperCase() === 'USD') {
            return true;
          }
          // Basic Solana address validation (base58, 32-44 chars)
          if (input.length < 32 || input.length > 44) {
            return 'Please enter a valid Solana token address (32-44 characters)';
          }
          return true;
        }
      }
    ]);

    return tokenAddress.trim() === '' ? 'USD' : tokenAddress.trim();
  }

  private async executeMethod(service: ServiceInfo, methodName: string, tokenAddress: string): Promise<void> {
    const spinner = ora(`Executing ${service.name}.${methodName}...`).start();

    try {
      const method = service.instance[methodName];

      if (typeof method !== 'function') {
        spinner.fail(`Method ${methodName} not found`);
        return;
      }

      // Check method parameters
      const methodStr = method.toString();
      const paramsMatch = methodStr.match(/\(([^)]*)\)/);
      const params = paramsMatch ? paramsMatch[1].split(',').map(p => p.trim()).filter(p => p) : [];

      let result;

      if (params.length === 0) {
        result = await method.call(service.instance);
      } else {
        // First parameter is expected to be tokenAddress
        result = await method.call(service.instance, tokenAddress);
      }

      spinner.succeed(`✅ ${service.name}.${methodName} executed successfully`);

      console.log(chalk.green('\n📊 Result:'));
      console.log(chalk.white(JSON.stringify(result, null, 2)));

    } catch (error) {
      spinner.fail(`❌ Error executing ${service.name}.${methodName}`);
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    }
  }

  private async showMenu(): Promise<void> {
    console.clear();
    console.log(chalk.blue.bold('🚀 Solana Memecoin API CLI Tool\n'));
    console.log(chalk.gray('Interactive CLI for testing API services\n'));

    while (true) {
      const service = await this.selectService();

      if (!service) {
        console.log(chalk.yellow('\n👋 Goodbye!'));
        break;
      }

      const method = await this.selectMethod(service);

      if (!method) {
        continue;
      }

      const tokenAddress = await this.getTokenAddress();

      await this.executeMethod(service, method, tokenAddress);

      const { continueTesting } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueTesting',
          message: chalk.yellow('Continue testing?'),
          default: true
        }
      ]);

      if (!continueTesting) {
        console.log(chalk.yellow('\n👋 Goodbye!'));
        break;
      }

      console.log(chalk.gray('\n' + '='.repeat(50) + '\n'));
    }
  }

  public async start(): Promise<void> {
    try {
      console.log(chalk.blue('🚀 Starting CLI...'));
      this.showMenu();
    } catch (error) {
      console.error(chalk.red('CLI Error:'), error);
      process.exit(1);
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

// Start the CLI
if (require.main === module) {
  const cli = new InteractiveCLI();
  cli.start();
}

export default InteractiveCLI;
