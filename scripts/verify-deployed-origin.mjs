import { writeFile } from 'node:fs/promises';

const rawOrigin =
  process.env.DEPLOYED_ORIGIN ??
  process.argv[2] ??
  '';

const expectedCommit =
  process.env.EXPECTED_COMMIT_SHA?.trim() ||
  undefined;

const requireHsts =
  process.env.REQUIRE_HSTS === 'true';

const timeoutMs = Number(
  process.env.DEPLOYED_VERIFY_TIMEOUT_MS ?? 15000,
);

const report = {
  origin: rawOrigin,
  expectedCommit:
    expectedCommit ?? null,
  observedCommit: null,
  buildId: null,
  appVersion: null,
  angularVersion: null,
  verifiedAt: new Date().toISOString(),
  checks: [],
};

let failed = false;

function addCheck(name, passed, detail) {
  report.checks.push({
    name,
    passed,
    detail,
  });

  const marker = passed ? 'PASS' : 'FAIL';
  console.log(
    `[${marker}] ${name}: ${detail}`,
  );

  if (!passed) {
    failed = true;
  }
}

function failCheck(name, error) {
  addCheck(
    name,
    false,
    error instanceof Error
      ? error.message
      : String(error),
  );
}

function requireValue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function header(response, name) {
  return response.headers.get(name)?.trim() ?? '';
}

function headerContains(response, name, expected) {
  const value = header(response, name);
  requireValue(
    value.toLowerCase().includes(
      expected.toLowerCase(),
    ),
    `${name} must contain "${expected}" (received "${value || '<missing>'}")`,
  );
}

function headerEquals(response, name, expected) {
  const value = header(response, name);
  requireValue(
    value.toLowerCase() ===
      expected.toLowerCase(),
    `${name} must equal "${expected}" (received "${value || '<missing>'}")`,
  );
}

async function request(path, options = {}) {
  const url = new URL(path, origin);
  const response = await fetch(url, {
    redirect: options.redirect ?? 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      'user-agent':
        'angular-inventory-deployment-verifier/1.0',
      ...(options.headers ?? {}),
    },
  });

  return response;
}

async function runCheck(name, fn) {
  try {
    const detail = await fn();
    addCheck(
      name,
      true,
      detail ?? 'verified',
    );
  } catch (error) {
    failCheck(name, error);
  }
}

let origin;

try {
  origin = new URL(rawOrigin);
  requireValue(
    origin.protocol === 'https:',
    'DEPLOYED_ORIGIN must use HTTPS.',
  );
  requireValue(
    origin.origin === origin.href.replace(/\/$/, ''),
    'DEPLOYED_ORIGIN must be an origin only, without a path, query, or fragment.',
  );
  requireValue(
    !origin.username && !origin.password,
    'DEPLOYED_ORIGIN must not contain credentials.',
  );
  origin = new URL(
    origin.origin + '/',
  );

  addCheck(
    'origin configuration',
    true,
    origin.origin,
  );
} catch (error) {
  failCheck(
    'origin configuration',
    error,
  );
}

if (origin) {
  await runCheck(
    'HTTP redirects to HTTPS',
    async () => {
      const httpUrl = new URL(origin);
      httpUrl.protocol = 'http:';

      const response = await fetch(httpUrl, {
        redirect: 'manual',
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          'user-agent':
            'angular-inventory-deployment-verifier/1.0',
        },
      });

      requireValue(
        [301, 302, 307, 308].includes(
          response.status,
        ),
        `HTTP origin must redirect to HTTPS (received HTTP ${response.status}).`,
      );

      const location = response.headers.get(
        'location',
      );
      requireValue(
        Boolean(location),
        'HTTP redirect is missing Location.',
      );

      const redirected = new URL(
        location,
        httpUrl,
      );
      requireValue(
        redirected.protocol === 'https:',
        `HTTP redirect must target HTTPS (received ${redirected.href}).`,
      );
      requireValue(
        redirected.hostname === origin.hostname,
        `HTTP redirect changed host to ${redirected.hostname}.`,
      );

      return `HTTP ${response.status} → ${redirected.href}`;
    },
  );

  let indexHtml = '';

  await runCheck(
    'root application response',
    async () => {
      const response = await request('/');
      requireValue(
        response.status === 200,
        `Expected HTTP 200, received ${response.status}.`,
      );

      indexHtml = await response.text();
      requireValue(
        indexHtml.includes('<app-root'),
        'Root response does not contain the Angular app root.',
      );

      return 'HTTP 200 with Angular app root';
    },
  );

  let rootResponse;

  await runCheck(
    'production security headers',
    async () => {
      rootResponse = await request('/');

      headerEquals(
        rootResponse,
        'x-content-type-options',
        'nosniff',
      );
      headerEquals(
        rootResponse,
        'referrer-policy',
        'same-origin',
      );
      headerEquals(
        rootResponse,
        'permissions-policy',
        'camera=(), microphone=(), geolocation=()',
      );
      headerEquals(
        rootResponse,
        'cross-origin-opener-policy',
        'same-origin',
      );
      headerEquals(
        rootResponse,
        'x-frame-options',
        'DENY',
      );

      headerContains(
        rootResponse,
        'content-security-policy',
        "object-src 'none'",
      );
      headerContains(
        rootResponse,
        'content-security-policy',
        "base-uri 'self'",
      );
      headerContains(
        rootResponse,
        'content-security-policy',
        "frame-ancestors 'none'",
      );
      headerContains(
        rootResponse,
        'content-security-policy',
        "form-action 'self'",
      );
      headerContains(
        rootResponse,
        'content-security-policy',
        'trusted-types angular angular#bundler',
      );

      const csp = header(
        rootResponse,
        'content-security-policy',
      );
      requireValue(
        !csp.includes(
          "require-trusted-types-for 'script'",
        ),
        "CSP must not reintroduce require-trusted-types-for 'script' before Angular autoCSP bootstrap.",
      );

      const server = header(
        rootResponse,
        'server',
      );
      requireValue(
        !server.includes('/'),
        `Server header must not disclose a version (received "${server}").`,
      );

      if (requireHsts) {
        headerContains(
          rootResponse,
          'strict-transport-security',
          'max-age=',
        );
      }

      return requireHsts
        ? 'security headers + HSTS verified'
        : 'security headers verified; HSTS optional';
    },
  );

  await runCheck(
    'health endpoint',
    async () => {
      const response = await request(
        '/healthz',
      );
      requireValue(
        response.status === 200,
        `Expected HTTP 200, received ${response.status}.`,
      );

      const body = (
        await response.text()
      ).trim();
      requireValue(
        body === 'ok',
        `Expected body "ok", received "${body}".`,
      );

      headerContains(
        response,
        'cache-control',
        'no-store',
      );

      return '/healthz returned ok';
    },
  );

  await runCheck(
    'build identity',
    async () => {
      const response = await request(
        '/build-info.json',
      );
      requireValue(
        response.status === 200,
        `Expected HTTP 200, received ${response.status}.`,
      );

      headerContains(
        response,
        'cache-control',
        'no-store',
      );

      const info = await response.json();

      requireValue(
        info.appName ===
          'angular-inventory-system',
        `Unexpected appName "${info.appName}".`,
      );
      requireValue(
        typeof info.version === 'string' &&
          info.version.length > 0,
        'Build metadata is missing version.',
      );
      requireValue(
        /^22\.\d+\.\d+$/.test(
          info.angularVersion ?? '',
        ),
        `Unexpected Angular version "${info.angularVersion}".`,
      );
      requireValue(
        /^[0-9a-f]{7,64}$/i.test(
          info.commitSha ?? '',
        ),
        `Invalid commitSha "${info.commitSha}".`,
      );
      requireValue(
        /^[A-Za-z0-9._:-]{1,128}$/.test(
          info.buildId ?? '',
        ),
        `Invalid buildId "${info.buildId}".`,
      );

      report.observedCommit =
        info.commitSha.toLowerCase();
      report.buildId = info.buildId;
      report.appVersion = info.version;
      report.angularVersion =
        info.angularVersion;

      if (expectedCommit) {
        const expected =
          expectedCommit.toLowerCase();
        const observed =
          info.commitSha.toLowerCase();

        requireValue(
          observed === expected ||
            observed.startsWith(expected) ||
            expected.startsWith(observed),
          `Deployed commit ${observed} does not match expected commit ${expected}.`,
        );
      }

      return `${info.version} @ ${info.commitSha} (build ${info.buildId})`;
    },
  );

  await runCheck(
    'SPA deep-link fallback',
    async () => {
      const response = await request(
        '/products',
      );
      requireValue(
        response.status === 200,
        `Expected HTTP 200, received ${response.status}.`,
      );

      const body = await response.text();
      requireValue(
        body.includes('<app-root'),
        'Deep link did not return the Angular app.',
      );

      headerContains(
        response,
        'cache-control',
        'no-store',
      );

      return '/products served Angular index';
    },
  );

  await runCheck(
    'hashed asset caching',
    async () => {
      requireValue(
        Boolean(indexHtml),
        'Root HTML was unavailable for asset discovery.',
      );

      const match = indexHtml.match(
        /(?:src|href)="([^"]+\.(?:js|css))"/,
      );
      requireValue(
        Boolean(match?.[1]),
        'Could not discover a generated JS/CSS asset.',
      );

      const assetPath = new URL(
        match[1],
        origin,
      );
      const response = await fetch(
        assetPath,
        {
          redirect: 'follow',
          signal:
            AbortSignal.timeout(timeoutMs),
          headers: {
            'user-agent':
              'angular-inventory-deployment-verifier/1.0',
          },
        },
      );

      requireValue(
        response.status === 200,
        `${assetPath.pathname} returned HTTP ${response.status}.`,
      );
      headerContains(
        response,
        'cache-control',
        'max-age=31536000',
      );
      headerContains(
        response,
        'cache-control',
        'immutable',
      );

      return `${assetPath.pathname} is immutable for one year`;
    },
  );

  await runCheck(
    'backend readiness through deployed origin',
    async () => {
      const response = await request(
        '/api/v1/health/ready',
      );
      requireValue(
        response.status === 200,
        `Expected HTTP 200, received ${response.status}.`,
      );

      const body = await response.json();
      requireValue(
        body.status === 'ok',
        `Backend status must be "ok" (received "${body.status}").`,
      );
      requireValue(
        body.database === 'up',
        `Backend database must be "up" (received "${body.database}").`,
      );

      return 'NestJS readiness and database are healthy through /api/v1';
    },
  );
}

const outputPath =
  process.env.DEPLOYMENT_REPORT_PATH ??
  'deployment-verification-report.json';

await writeFile(
  outputPath,
  JSON.stringify(report, null, 2) + '\n',
);

if (
  process.env.GITHUB_STEP_SUMMARY
) {
  const lines = [
    '# Deployed Origin Verification',
    '',
    `- **Origin:** ${report.origin || '<unset>'}`,
    `- **Expected commit:** ${report.expectedCommit ?? '<not enforced>'}`,
    `- **Observed commit:** ${report.observedCommit ?? '<unavailable>'}`,
    `- **Build ID:** ${report.buildId ?? '<unavailable>'}`,
    '',
    '| Check | Result | Detail |',
    '| --- | --- | --- |',
    ...report.checks.map(
      (check) =>
        `| ${check.name} | ${check.passed ? 'PASS' : 'FAIL'} | ${String(check.detail).replaceAll('|', '\\|')} |`,
    ),
    '',
  ];

  await writeFile(
    process.env.GITHUB_STEP_SUMMARY,
    lines.join('\n'),
    {
      flag: 'a',
    },
  );
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(
    `Deployed origin verified successfully: ${origin?.origin ?? rawOrigin}`,
  );
}
