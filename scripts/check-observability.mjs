import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const appConfig = await readFile('src/app/app.config.ts', 'utf8');
const diagnosticModel = await readFile(
  'src/app/core/observability/client-diagnostic.model.ts',
  'utf8',
);
const errorInterceptor = await readFile(
  'src/app/core/http/interceptors/error.interceptor.ts',
  'utf8',
);
const generator = await readFile('scripts/generate-build-info.mjs', 'utf8');
const dockerfile = await readFile('Dockerfile', 'utf8');
const ci = await readFile('.github/workflows/ci.yml', 'utf8');
const nginx = await readFile('docker/nginx/default.conf.template', 'utf8');

const violations = [];

function requireText(source, pattern, message) {
  if (!pattern.test(source)) {
    violations.push(message);
  }
}

requireText(
  appConfig,
  /provideBrowserGlobalErrorListeners\(\)/,
  'Angular browser-global error listeners must remain enabled.',
);
requireText(
  appConfig,
  /provide:\s*ErrorHandler,\s*useClass:\s*AppErrorHandler/,
  'Application ErrorHandler must use AppErrorHandler.',
);
requireText(
  errorInterceptor,
  /diagnostics\.captureApiError\(normalized\)/,
  'API error interceptor must report normalized operational failures.',
);
requireText(
  errorInterceptor,
  /request\.headers\.get\('X-Request-ID'\)/,
  'API error interceptor must preserve the outbound request ID fallback.',
);

for (const forbiddenField of [
  'message',
  'password',
  'accessToken',
  'authorization',
  'email',
  'userId',
  'requestBody',
  'responseBody',
  'validationErrors',
]) {
  const pattern = new RegExp(`readonly\\s+${forbiddenField}\\??\\s*:`, 'i');

  if (pattern.test(diagnosticModel)) {
    violations.push(
      `ClientDiagnosticEvent must not contain sensitive/raw field: ${forbiddenField}.`,
    );
  }
}

if (
  packageJson.scripts?.build !== 'npm run generate:build-info && ng build' ||
  packageJson.scripts?.['build:production'] !==
    'npm run generate:build-info && ng build --configuration production'
) {
  violations.push('Angular build scripts must generate build metadata before compilation.');
}

requireText(
  generator,
  /VERCEL_GIT_COMMIT_SHA/,
  'Build metadata generator must support Vercel commit metadata.',
);
requireText(
  generator,
  /GITHUB_SHA/,
  'Build metadata generator must support GitHub commit metadata.',
);
requireText(
  dockerfile,
  /ARG APP_COMMIT_SHA=development[\s\S]*ARG APP_BUILD_ID=local/,
  'Docker build stage must accept safe commit/build metadata arguments.',
);
requireText(
  ci,
  /--build-arg APP_COMMIT_SHA="\$\{GITHUB_SHA\}"/,
  'CI Docker build must pass the GitHub commit SHA.',
);
requireText(
  ci,
  /--build-arg APP_BUILD_ID="\$\{GITHUB_RUN_ID\}"/,
  'CI Docker build must pass the GitHub run ID.',
);
requireText(
  nginx,
  /location = \/build-info\.json[\s\S]*Cache-Control "no-store"/,
  'Nginx must serve build-info.json with no-store caching.',
);

if (violations.length > 0) {
  console.error('Observability guard failed:\n');

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exitCode = 1;
} else {
  console.log(
    'Observability guard passed: safe diagnostics, request correlation, and build metadata contracts are enforced.',
  );
}
