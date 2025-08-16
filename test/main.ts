#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface TestService {
  index: number;
  name: string;
  path: string;
}

class TestRunnerCLI {
  private servicesDir = path.join(__dirname, 'unit', 'services');
  private services: TestService[] = [];

  constructor() {
    this.loadServices();
  }

  private loadServices(): void {
    try {
      const files = fs.readdirSync(this.servicesDir);
      const specFiles = files.filter(file => file.endsWith('.spec.ts'));

      this.services = specFiles.map((file, index) => ({
        index: index + 1,
        name: file.replace('.spec.ts', ''),
        path: file
      }));
    } catch (error) {
      console.error('Error loading test services:', error);
      process.exit(1);
    }
  }

  private displayServices(): void {
    console.log('\n🧪 Available Test Services\n');
    console.log('0. Run all tests');
    this.services.forEach(service => {
      console.log(`${service.index}. ${service.name}`);
    });
    console.log('\nEnter the number of the service to test (or 0 for all):');
  }

  private async getUserInput(): Promise<string> {
    return new Promise((resolve) => {
      process.stdin.setEncoding('utf8');
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim());
      });
    });
  }

  private runTest(serviceName?: string): void {
    try {
      let command = 'npm test';
      if (serviceName && serviceName !== 'all') {
        command += ` -- ${serviceName}.spec.ts`;
      }

      console.log(`\n🚀 Running: ${command}\n`);
      execSync(command, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      console.error('❌ Error running tests:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    console.clear();
    console.log('🎯 Solana Memecoin API Test Runner\n');

    if (this.services.length === 0) {
      console.log('❌ No test services found in test/unit/services/');
      return;
    }

    this.displayServices();

    const input = await this.getUserInput();
    const choice = parseInt(input, 10);

    if (isNaN(choice)) {
      console.log('❌ Invalid input. Please enter a number.');
      return;
    }

    if (choice === 0) {
      this.runTest('all');
    } else if (choice > 0 && choice <= this.services.length) {
      const selectedService = this.services[choice - 1];
      this.runTest(selectedService.name);
    } else {
      console.log('❌ Invalid choice. Please select a valid number.');
    }
  }
}

// Run the CLI
if (require.main === module) {
  const cli = new TestRunnerCLI();
  cli.start().catch(console.error);
}

export default TestRunnerCLI;
