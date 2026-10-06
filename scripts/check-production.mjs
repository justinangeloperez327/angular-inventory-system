import { readFile } from 'node:fs/promises';

const angular = JSON.parse(await readFile('angular.json', 'utf8'));
const tsconfig = JSON.parse(await readFile('tsconfig.json', 'utf8'));
const project = angular.projects?.['angular-inventory-system'];
const production = project?.architect?.build?.configurations?.production;
const violations = [];

function parseKilobytes(value) {
  if (typeof value !== 'string') {
    return Number.NaN;
  }

  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(kB|MB)$/i);

  if (!match) {
    return Number.NaN;
  }

  const amount = Number(match[1]);
  return match[2].toLowerCase() === 'mb' ? amount * 1024 : amount;
}

function requireBudget(type, maximumWarningKb, maximumErrorKb) {
  const budget = production?.budgets?.find((entry) => entry.type === type);

  if (!budget) {
    violations.push(`angular.json: missing production ${type} budget.`);
    return;
  }

  const warning = parseKilobytes(budget.maximumWarning);
  const error = parseKilobytes(budget.maximumError);

  if (!Number.isFinite(warning) || warning > maximumWarningKb) {
    violations.push(
      `angular.json: ${type}.maximumWarning must be <= ${maximumWarningKb}kB (found ${budget.maximumWarning ?? 'unset'}).`,
    );
  }

  if (!Number.isFinite(error) || error > maximumErrorKb) {
    violations.push(
      `angular.json: ${type}.maximumError must be <= ${maximumErrorKb}kB (found ${budget.maximumError ?? 'unset'}).`,
    );
  }
}

if (!production) {
  violations.push('angular.json: production build configuration is missing.');
} else {
  if (production.sourceMap !== false) {
    violations.push('angular.json: production sourceMap must remain false.');
  }

  if (production.outputHashing !== 'all') {
    violations.push('angular.json: production outputHashing must remain "all".');
  }

  if (production.security?.autoCsp !== true) {
    violations.push('angular.json: production security.autoCsp must remain enabled.');
  }

  requireBudget('initial', 360, 400);
  requireBudget('anyScript', 170, 200);
}

if (tsconfig.angularCompilerOptions?.extendedDiagnostics?.defaultCategory !== 'error') {
  violations.push(
    'tsconfig.json: Angular extended diagnostics must use defaultCategory "error".',
  );
}

if (violations.length > 0) {
  console.error('Production guard failed:\n');

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exitCode = 1;
} else {
  console.log(
    'Production guard passed: diagnostics, security settings, source maps, hashing, and bundle ceilings are enforced.',
  );
}
