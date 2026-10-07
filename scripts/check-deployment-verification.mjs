import { readFile } from 'node:fs/promises';

const vercel = JSON.parse(
  await readFile('vercel.json', 'utf8'),
);
const workflow = await readFile(
  '.github/workflows/deployed-origin.yml',
  'utf8',
);
const verifier = await readFile(
  'scripts/verify-deployed-origin.mjs',
  'utf8',
);
const health = await readFile(
  'public/healthz',
  'utf8',
);
const violations = [];

function requireValue(condition, message) {
  if (!condition) {
    violations.push(message);
  }
}

function headerValue(source, key) {
  const global = vercel.headers?.find(
    (entry) =>
      entry.source === source,
  );

  return global?.headers?.find(
    (header) =>
      header.key.toLowerCase() ===
      key.toLowerCase(),
  )?.value;
}

const apiRewrite =
  vercel.rewrites?.find(
    (rewrite) =>
      rewrite.source ===
      '/api/v1/:path*',
  );

requireValue(
  vercel.git?.deploymentEnabled === false,
  'vercel.json must keep automatic Git deployments disabled.',
);

requireValue(
  apiRewrite?.destination ===
    'https://nest-js-inventory-system.vercel.app/api/v1/:path*',
  'vercel.json must proxy /api/v1 to the canonical NestJS production origin.',
);

const securityHeaders = {
  'X-Content-Type-Options':
    'nosniff',
  'Referrer-Policy':
    'same-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy':
    'same-origin',
  'X-Frame-Options':
    'DENY',
};

for (const [key, value] of Object.entries(
  securityHeaders,
)) {
  requireValue(
    headerValue('/(.*)', key) ===
      value,
    `vercel.json must set ${key}: ${value} globally.`,
  );
}

const csp = headerValue(
  '/(.*)',
  'Content-Security-Policy',
);

for (const directive of [
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  'trusted-types angular angular#bundler',
]) {
  requireValue(
    csp?.includes(directive),
    `Vercel CSP must retain: ${directive}.`,
  );
}

requireValue(
  !csp?.includes(
    "require-trusted-types-for 'script'",
  ),
  "Vercel CSP must not reintroduce require-trusted-types-for 'script'.",
);

requireValue(
  headerValue(
    '/api/v1/:path*',
    'x-vercel-enable-rewrite-caching',
  ) === '0',
  'Vercel must disable caching for the external API rewrite.',
);

for (const path of [
  '/index.html',
  '/build-info.json',
  '/healthz',
]) {
  requireValue(
    headerValue(path, 'Cache-Control') ===
      'no-store',
    `${path} must use Cache-Control: no-store on Vercel.`,
  );
}

for (const path of [
  '/(.*).js',
  '/(.*).css',
]) {
  requireValue(
    headerValue(path, 'Cache-Control') ===
      'public, max-age=31536000, immutable',
    `${path} must use immutable one-year browser caching on Vercel.`,
  );
}

requireValue(
  health.trim() === 'ok',
  'public/healthz must contain exactly "ok".',
);

for (const required of [
  'workflow_dispatch:',
  'environment: production',
  'permissions:',
  'contents: read',
  'npm ci --no-audit --no-fund',
  'npm run verify:deployed-origin',
  'npm run e2e:deployed',
  'deployment-verification-report.json',
  'if: always()',
]) {
  requireValue(
    workflow.includes(required),
    `deployed-origin workflow must contain: ${required}`,
  );
}

for (const required of [
  '/healthz',
  '/build-info.json',
  '/products',
  '/api/v1/health/ready',
  'content-security-policy',
  'max-age=31536000',
  'EXPECTED_COMMIT_SHA',
]) {
  requireValue(
    verifier.includes(required),
    `deployed-origin verifier must check: ${required}`,
  );
}

if (violations.length > 0) {
  console.error(
    'Deployment verification guard failed:\n',
  );

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exitCode = 1;
} else {
  console.log(
    'Deployment verification guard passed: public-origin workflow, Vercel routing, headers, health, identity, caching, and API checks are enforced.',
  );
}
