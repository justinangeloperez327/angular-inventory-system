import { readFile } from 'node:fs/promises';

const dockerfile = await readFile('Dockerfile', 'utf8');
const nginx = await readFile('docker/nginx/default.conf.template', 'utf8');
const headers = await readFile('docker/nginx/security-headers.conf', 'utf8');

const violations = [];

function requireText(source, pattern, message) {
  if (!pattern.test(source)) {
    violations.push(message);
  }
}

requireText(dockerfile, /ARG NODE_VERSION=24\.15\.0/, 'Dockerfile must keep the validated Node 24.15.0 build runtime.');
requireText(dockerfile, /COPY package\.json package-lock\.json \.\//, 'Dockerfile must copy the npm lockfile before dependency installation.');
requireText(dockerfile, /RUN npm ci --no-audit --no-fund/, 'Dockerfile must use npm ci for reproducible builds.');
requireText(dockerfile, /HEALTHCHECK[\s\S]*\/healthz/, 'Dockerfile must retain the /healthz container health check.');

requireText(nginx, /server_tokens\s+off;/, 'Nginx must suppress version tokens.');
requireText(nginx, /include \/etc\/nginx\/security-headers\.conf;/, 'Nginx server must include the security header policy.');
requireText(nginx, /location = \/healthz[\s\S]*return 200 "ok\\n";/, 'Nginx must retain the explicit /healthz endpoint.');
requireText(nginx, /location \/api\/[\s\S]*proxy_pass \$\{API_UPSTREAM\};/, 'Nginx must proxy /api/ to API_UPSTREAM.');
requireText(nginx, /location = \/index\.html[\s\S]*Cache-Control "no-store"/, 'index.html must remain non-cacheable.');
requireText(nginx, /location = \/build-info\.json[\s\S]*Cache-Control "no-store"/, 'build-info.json must remain non-cacheable.');
requireText(nginx, /location ~\* \\.\(\?:js\|css\)\$[\s\S]*immutable/, 'Hashed JavaScript/CSS assets must retain immutable caching.');
requireText(nginx, /location \/ \{[\s\S]*try_files \$uri \$uri\/ \/index\.html;/, 'SPA routes must fall back to index.html.');

const requiredHeaders = [
  [/add_header X-Content-Type-Options "nosniff" always;/, 'X-Content-Type-Options: nosniff'],
  [/add_header Referrer-Policy "same-origin" always;/, 'Referrer-Policy: same-origin'],
  [/add_header Permissions-Policy "camera=\(\), microphone=\(\), geolocation=\(\)" always;/, 'restrictive Permissions-Policy'],
  [/add_header Cross-Origin-Opener-Policy "same-origin" always;/, 'Cross-Origin-Opener-Policy: same-origin'],
  [/add_header X-Frame-Options "DENY" always;/, 'X-Frame-Options: DENY'],
];

for (const [pattern, label] of requiredHeaders) {
  requireText(headers, pattern, `Security header policy must retain ${label}.`);
}

for (const directive of [
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "trusted-types angular angular#bundler",
]) {
  if (!headers.includes(directive)) {
    violations.push(`Content-Security-Policy must retain: ${directive}.`);
  }
}

if (headers.includes("require-trusted-types-for 'script'")) {
  violations.push(
    "Content-Security-Policy must not enforce require-trusted-types-for 'script' while Angular security.autoCsp uses its pre-bootstrap string script loader.",
  );
}

if (violations.length > 0) {
  console.error('Runtime configuration guard failed:\n');

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exitCode = 1;
} else {
  console.log('Runtime configuration guard passed: Nginx security, routing, caching, and health contracts are intact.');
}
