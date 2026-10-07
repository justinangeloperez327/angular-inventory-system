# Dependency Management

The frontend uses npm with a committed lockfile so local development, CI, and Docker resolve the same dependency graph.

## Runtime and package manager

The supported Node.js range is declared in `package.json`:

```text
^22.22.3 || ^24.15.0 || ^26.0.0
```

CI uses Node 24.15.0. The repository records `npm@11.12.1` through the `packageManager` field.

## Lockfile

`package-lock.json` is committed and is part of the source contract.

Use:

```bash
npm ci
```

for clean/reproducible installs. `npm ci` fails when `package.json` and `package-lock.json` disagree instead of silently changing dependency resolution.

For an intentional dependency change use `npm install` or `npm install -D`, review the lockfile diff, and commit both manifest files.

## CI and Docker

GitHub Actions installs with:

```bash
npm ci --no-audit --no-fund
npm audit --audit-level=high
```

The vulnerability audit is a separate release gate so install behavior remains deterministic.

The Docker build follows the same lockfile:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
```

No additional repository script duplicates npm's own package/lockfile consistency checks.

## Dependabot

Dependabot remains enabled for npm packages and GitHub Actions.

Dependency updates must preserve the lockfile and pass the normal release gate:

```bash
npm run check
```

Do not weaken the audit or bypass the lockfile to make CI pass.
