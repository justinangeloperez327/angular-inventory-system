import { createPlaywrightConfig } from './playwright.shared';

export default createPlaywrightConfig({
  testDir: './deployment-e2e',
  baseURL:
    process.env['DEPLOYED_ORIGIN'] ??
    'https://angular-inventory-system.vercel.app',
  outputDir: 'test-results/deployed-origin',
  projectName: 'chromium-deployed-origin',
  fullyParallel: false,
  workers: 1,
});
