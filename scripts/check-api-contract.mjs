import { access, readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const backendRoot = join(root, '.contract-backend');
const contract = JSON.parse(
  await readFile(join(root, 'contracts', 'backend-api-contract.json'), 'utf8'),
);
const workflow = await readFile(join(root, '.github', 'workflows', 'ci.yml'), 'utf8');
const violations = [];

function report(message) {
  violations.push(message);
}

function normalizeRoute(value) {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\$\{\s*encodeURIComponent\(([^)]+)\)\s*\}/g, ':param')
    .replace(/\$\{\s*([^}]+)\s*\}/g, ':param')
    .replace(/:[A-Za-z0-9_]+/g, ':param')
    .replace(/\{[A-Za-z0-9_]+\}/g, ':param')
    .replace(/\/+/g, '/');
}

function methodName(value) {
  return value === 'getBlob' ? 'GET' : value.toUpperCase();
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory, predicate) {
  const results = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await walk(fullPath, predicate)));
    } else if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

function readQuotedArgument(source, openParenIndex) {
  let index = openParenIndex + 1;

  while (/\s/.test(source[index] ?? '')) {
    index += 1;
  }

  const quote = source[index];

  if (quote !== "'" && quote !== '"' && quote !== '`') {
    return null;
  }

  index += 1;
  let value = '';

  while (index < source.length) {
    const character = source[index];

    if (character === '\\') {
      value += character + (source[index + 1] ?? '');
      index += 2;
      continue;
    }

    if (character === quote) {
      return value;
    }

    value += character;
    index += 1;
  }

  return null;
}

function skipTypeArguments(source, index) {
  while (/\s/.test(source[index] ?? '')) {
    index += 1;
  }

  if (source[index] !== '<') {
    return index;
  }

  let depth = 0;

  for (; index < source.length; index += 1) {
    const character = source[index];

    if (character === '<') {
      depth += 1;
    } else if (character === '>') {
      depth -= 1;

      if (depth === 0) {
        return index + 1;
      }
    }
  }

  return index;
}

function extractFrontendEndpoints(source, file) {
  const endpoints = [];
  const pattern = /this\.api\.(getBlob|get|post|put|patch|delete)\b/g;

  for (const match of source.matchAll(pattern)) {
    const method = match[1];
    let index = (match.index ?? 0) + match[0].length;
    index = skipTypeArguments(source, index);

    while (/\s/.test(source[index] ?? '')) {
      index += 1;
    }

    if (source[index] !== '(') {
      report(`${file}: could not parse API call after this.api.${method}.`);
      continue;
    }

    const route = readQuotedArgument(source, index);

    if (route === null) {
      report(
        `${file}: API endpoint paths must be explicit string/template literals for contract verification.`,
      );
      continue;
    }

    endpoints.push({
      method: methodName(method),
      route: normalizeRoute(route),
      source: file,
    });
  }

  return endpoints;
}

function extractBackendEndpoints(source, file) {
  const controllerMatch = source.match(/@Controller\(\s*'([^']*)'\s*\)/);
  const base = normalizeRoute(controllerMatch?.[1] ?? '');
  const endpoints = [];
  const routePattern = /@(Get|Post|Put|Patch|Delete)\(\s*(?:'([^']*)')?\s*\)/g;

  for (const match of source.matchAll(routePattern)) {
    const route = normalizeRoute([base, match[2] ?? ''].filter(Boolean).join('/'));
    endpoints.push({
      method: match[1].toUpperCase(),
      route,
      source: file,
    });
  }

  return endpoints;
}

async function readApiBaseUrl(path) {
  const source = await readFile(path, 'utf8');
  return source.match(/apiBaseUrl:\s*'([^']+)'/)?.[1];
}

const devBase = await readApiBaseUrl(join(root, 'src', 'environments', 'environment.ts'));
const prodBase = await readApiBaseUrl(
  join(root, 'src', 'environments', 'environment.production.ts'),
);

if (devBase !== contract.apiPrefix) {
  report(
    `Development apiBaseUrl must match backend contract ${contract.apiPrefix} (found ${devBase ?? 'unset'}).`,
  );
}

if (prodBase !== contract.apiPrefix) {
  report(
    `Production apiBaseUrl must match backend contract ${contract.apiPrefix} (found ${prodBase ?? 'unset'}).`,
  );
}

if (!workflow.includes(`repository: ${contract.repository}`)) {
  report('CI must checkout the pinned backend contract repository.');
}

if (!workflow.includes(`ref: ${contract.ref}`)) {
  report('CI backend checkout must use the pinned backend contract SHA.');
}

if (!workflow.includes('path: .contract-backend')) {
  report('CI backend checkout must use .contract-backend.');
}

const backendPresent = await fileExists(backendRoot);

if (!backendPresent) {
  if (process.env.CI) {
    report('Pinned backend checkout is missing in CI.');
  } else {
    console.log(
      'Backend checkout not present locally; prefix/workflow contract validated. CI performs the cross-repository route comparison.',
    );
  }
} else {
  const backendPackage = JSON.parse(
    await readFile(join(backendRoot, 'package.json'), 'utf8'),
  );

  if (backendPackage.version !== contract.packageVersion) {
    report(
      `Pinned backend package version must be ${contract.packageVersion} (found ${backendPackage.version}).`,
    );
  }

  const backendMain = await readFile(join(backendRoot, 'src', 'main.ts'), 'utf8');
  const defaultPrefix =
    backendMain.match(/config\.get<string>\('app\.apiPrefix'\)\s*\?\?\s*'([^']+)'/)?.[1];

  if (`/${defaultPrefix ?? ''}` !== contract.apiPrefix) {
    report(
      `Backend default API prefix must match ${contract.apiPrefix} (found /${defaultPrefix ?? 'unset'}).`,
    );
  }

  const frontendFiles = await walk(
    join(root, 'src', 'app'),
    (path) => path.endsWith('api.service.ts'),
  );
  const backendFiles = await walk(
    join(backendRoot, 'src'),
    (path) => path.endsWith('controller.ts'),
  );

  const frontendEndpoints = [];
  const backendEndpoints = [];

  for (const path of frontendFiles) {
    frontendEndpoints.push(
      ...extractFrontendEndpoints(
        await readFile(path, 'utf8'),
        relative(root, path),
      ),
    );
  }

  for (const path of backendFiles) {
    backendEndpoints.push(
      ...extractBackendEndpoints(
        await readFile(path, 'utf8'),
        relative(backendRoot, path),
      ),
    );
  }

  const backendSet = new Set(
    backendEndpoints.map((endpoint) => `${endpoint.method} ${endpoint.route}`),
  );

  for (const endpoint of frontendEndpoints) {
    const key = `${endpoint.method} ${endpoint.route}`;

    if (!backendSet.has(key)) {
      report(
        `${endpoint.source}: Angular calls ${key}, but the pinned NestJS controllers do not expose that route.`,
      );
    }
  }

  if (frontendEndpoints.length === 0) {
    report('No Angular API endpoints were discovered.');
  }

  console.log(
    `Compared ${frontendEndpoints.length} Angular API calls against ${backendEndpoints.length} NestJS controller routes from ${contract.ref.slice(0, 7)}.`,
  );
}

if (violations.length > 0) {
  console.error('API contract guard failed:\n');

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exitCode = 1;
} else {
  console.log(
    `API contract guard passed: Angular is aligned with ${contract.repository}@${contract.ref.slice(0, 7)} using ${contract.apiPrefix}.`,
  );
}
