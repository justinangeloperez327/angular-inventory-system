import { mkdir, readFile, writeFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

function normalizePackageVersion(value) {
  return typeof value === 'string' ? value.replace(/^[~^]/, '') : 'unknown';
}

function firstSafeValue(values, fallback) {
  for (const value of values) {
    if (typeof value === 'string' && /^[A-Za-z0-9._:-]{1,128}$/.test(value)) {
      return value;
    }
  }

  return fallback;
}

function firstCommit(values) {
  for (const value of values) {
    if (typeof value === 'string' && /^[0-9a-f]{7,64}$/i.test(value)) {
      return value.toLowerCase();
    }
  }

  return 'development';
}

const buildInfo = {
  appName: packageJson.name,
  version: packageJson.version,
  angularVersion: normalizePackageVersion(packageJson.dependencies?.['@angular/core']),
  commitSha: firstCommit([
    process.env.APP_COMMIT_SHA,
    process.env.GITHUB_SHA,
    process.env.VERCEL_GIT_COMMIT_SHA,
    process.env.CI_COMMIT_SHA,
  ]),
  buildId: firstSafeValue(
    [
      process.env.APP_BUILD_ID,
      process.env.GITHUB_RUN_ID,
      process.env.VERCEL_DEPLOYMENT_ID,
      process.env.CI_PIPELINE_ID,
    ],
    'local',
  ),
};

await mkdir('src/app/core/observability', { recursive: true });
await mkdir('public', { recursive: true });

await writeFile(
  'src/app/core/observability/build-info.generated.ts',
  [
    "import { ClientBuildInfo } from './client-diagnostic.model';",
    '',
    'export const GENERATED_BUILD_INFO: ClientBuildInfo = ' +
      JSON.stringify(buildInfo, null, 2) +
      ';',
    '',
  ].join('\n'),
);

await writeFile('public/build-info.json', JSON.stringify(buildInfo, null, 2) + '\n');

console.log(
  `Generated build metadata: ${buildInfo.version} @ ${buildInfo.commitSha} (build ${buildInfo.buildId}).`,
);
