import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from '@playwright/test';

interface PlaywrightConfigOptions {
  readonly testDir: string;
  readonly baseURL: string;
  readonly outputDir: string;
  readonly projectName: string;
  readonly fullyParallel: boolean;
  readonly workers?: number;
  readonly webServer?: PlaywrightTestConfig['webServer'];
}

export function createPlaywrightConfig(
  options: PlaywrightConfigOptions,
): PlaywrightTestConfig {
  const ci = Boolean(process.env['CI']);

  return defineConfig({
    testDir: options.testDir,
    fullyParallel: options.fullyParallel,
    forbidOnly: ci,
    retries: ci ? 1 : 0,
    workers: options.workers ?? (ci ? 2 : undefined),
    reporter: ci ? [['line'], ['html', { open: 'never' }]] : 'list',
    outputDir: options.outputDir,
    use: {
      baseURL: options.baseURL,
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
    },
    projects: [
      {
        name: options.projectName,
        use: { ...devices['Desktop Chrome'] },
      },
    ],
    webServer: options.webServer,
  });
}
