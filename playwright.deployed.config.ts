import { defineConfig, devices } from '@playwright/test';

const baseURL =
  process.env['DEPLOYED_ORIGIN'] ??
  'https://angular-inventory-system.vercel.app';

export default defineConfig({
  testDir: './deployment-e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: process.env['CI']
    ? [['line'], ['html', { open: 'never' }]]
    : 'list',
  outputDir: 'test-results/deployed-origin',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-deployed-origin',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
