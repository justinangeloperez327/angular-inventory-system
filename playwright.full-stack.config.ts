import { defineConfig, devices } from '@playwright/test';

const baseURL =
  process.env['FULL_STACK_BASE_URL'] ??
  'http://127.0.0.1:8080';

export default defineConfig({
  testDir: './integration-e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: process.env['CI']
    ? [['line'], ['html', { open: 'never' }]]
    : 'list',
  outputDir: 'test-results/full-stack',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-full-stack',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
