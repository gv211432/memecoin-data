#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
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

interface ServiceInfo {
  name: string;
  className: string;
  instance: any;
  methods: string[];
}

interface ServiceMethod {
  name: string;
  value: string;
}

class InteractiveCLI {
  private services: ServiceInfo[] = [];
  private app: any;

  constructor() {
    this.loadServices();
  }

  private async loadServices(): Promise<void> {
    const servicesDir = path.join(__dirname, 'services');

    try {
      const files = fs.readdirSync(servicesDir);
      const serviceFiles = files.filter(file => file.endsWith('.service.ts'));

      // Initialize NestJS app to get service instances
      this.app = await NestFactory.createApplicationContext(AppModule);

      for (const file of serviceFiles) {
        const serviceName = file.replace('.service.ts', '');
        const className = this.getClassNameFromFile(serviceName);

        let instance: any;
        let serviceClass: any;

        switch (serviceName) {
          case 'birdeye':
            serviceClass = BirdeyeService;
            break;
          case 'bitquery':
            serviceClass = BitqueryService;
            break;
          case 'coin-gecko':
            serviceClass = CoinGeckoService;
            break;
          case 'crypto-compare':
            serviceClass = CryptoCompareService;
            break;
          case 'defi-llama':
            serviceClass = DeFiLlamaService;
            break;
          case 'dex-screener':
            serviceClass = DexScreenerService;
            break;
          case 'gecko-terminal':
            serviceClass = GeckoTerminalService;
            break;
          case 'memecoin':
            serviceClass = MemecoinService;
            break;
          case 'pump-fun':
            serviceClass = PumpFunService;
            break;
          case 'rugcheck':
            serviceClass = RugCheckService;
            break;
        }

        if (serviceClass) {
          instance = this.app.get(serviceClass);
          const methods = this.getServiceMethods(instance);

          this.services.push({
            name: serviceName,
            className,
            instance,
            methods
          });
        }
      }
    } catch (error) {
      console.error(chalk.red('Error loading services:'), error);
      process.exit(1);
    }
  }

  private getClassNameFromFile(serviceName: string): string {
    return serviceName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
      .replace('service', 'Service');
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
      name: chalk.cyan(service.name),
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
        ]
      }
    ]);

    return selectedService;
  }

  private async selectMethod(service: ServiceInfo): Promise<string | null> {
    if (service.methods.length === 0) {
      console.log(chalk.red('No methods found for this service.'));
      return null;
    }

    const choices: ServiceMethod[] = service.methods.map(method => ({
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
        default: choices[0]?.value
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
            return 'Please enter a valid Solana token address';
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
      await this.showMenu();
    } catch (error) {
      console.error(chalk.red('CLI Error:'), error);
    } finally {
      if (this.app) {
        await this.app.close();
      }
      process.exit(0);
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
  cli.start().catch(console.error);
}

export default InteractiveCLI;
