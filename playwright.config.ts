import { createPlaywrightConfig } from './playwright.shared';

const baseURL = 'http://127.0.0.1:4200';

export default createPlaywrightConfig({
  testDir: './e2e',
  baseURL,
  outputDir: 'test-results',
  projectName: 'chromium',
  fullyParallel: true,
  webServer: {
    command: 'npm start -- --host 127.0.0.1 --port 4200',
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
