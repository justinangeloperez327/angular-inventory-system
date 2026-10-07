import { createPlaywrightConfig } from './playwright.shared';

export default createPlaywrightConfig({
  testDir: './integration-e2e',
  baseURL: process.env['FULL_STACK_BASE_URL'] ?? 'http://127.0.0.1:8080',
  outputDir: 'test-results/full-stack',
  projectName: 'chromium-full-stack',
  fullyParallel: false,
  workers: 1,
});
