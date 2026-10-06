import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const lockfile = JSON.parse(await readFile('package-lock.json', 'utf8'));
const ci = await readFile('.github/workflows/ci.yml', 'utf8');
const dockerfile = await readFile('Dockerfile', 'utf8');

const violations = [];
const expectedPackageManager = 'npm@11.12.1';

function compareDependencySection(section) {
  const declared = packageJson[section] ?? {};
  const locked = lockfile.packages?.['']?.[section] ?? {};

  for (const [name, specifier] of Object.entries(declared)) {
    if (locked[name] !== specifier) {
      violations.push(
        `package-lock.json: root ${section} entry ${name} must match package.json (${specifier}).`,
      );
    }
  }

  for (const name of Object.keys(locked)) {
    if (!(name in declared)) {
      violations.push(
        `package-lock.json: root ${section} contains undeclared dependency ${name}.`,
      );
    }
  }
}

if (packageJson.packageManager !== expectedPackageManager) {
  violations.push(
    `package.json: packageManager must be ${expectedPackageManager} (found ${packageJson.packageManager ?? 'unset'}).`,
  );
}

if (lockfile.lockfileVersion !== 3) {
  violations.push(
    `package-lock.json: lockfileVersion must be 3 (found ${lockfile.lockfileVersion ?? 'unset'}).`,
  );
}

if (lockfile.name !== packageJson.name || lockfile.version !== packageJson.version) {
  violations.push('package-lock.json: root name/version must match package.json.');
}

compareDependencySection('dependencies');
compareDependencySection('devDependencies');

if (!/run:\s+npm ci --no-audit --no-fund/.test(ci)) {
  violations.push('CI must install dependencies with npm ci.');
}

if (/run:\s+npm install\b/.test(ci)) {
  violations.push('CI must not use npm install.');
}

if (!/COPY package\.json package-lock\.json \.\//.test(dockerfile)) {
  violations.push('Dockerfile must copy package.json and package-lock.json before dependency installation.');
}

if (!/RUN npm ci --no-audit --no-fund/.test(dockerfile)) {
  violations.push('Dockerfile must install dependencies with npm ci.');
}

if (/RUN npm install\b/.test(dockerfile)) {
  violations.push('Dockerfile must not use npm install.');
}

if (violations.length > 0) {
  console.error('Dependency contract failed:\n');

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exitCode = 1;
} else {
  console.log(
    'Dependency contract passed: npm version, lockfile, CI, and Docker installs are reproducible.',
  );
}
