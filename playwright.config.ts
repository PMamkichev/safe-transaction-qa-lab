import 'dotenv/config';

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'unit',
      testMatch: 'unit/**/*.spec.ts',
      fullyParallel: true,
    },
    {
      name: 'read-only',
      testMatch: ['api/**/*.spec.ts', 'integration/**/*.spec.ts'],
      fullyParallel: true,
    },
    {
      name: 'sepolia-e2e',
      testMatch: 'transaction-flow/**/*.spec.ts',
      fullyParallel: false,
      workers: 1,
      timeout: 120_000,
    },
  ],
});
