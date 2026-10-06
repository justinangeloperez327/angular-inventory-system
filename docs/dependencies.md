# Dependency Management

Group 22 makes frontend dependency resolution reproducible across local verification, GitHub Actions, and Docker builds.

## Package manager

The repository records:

```text
npm 11.12.1
```

through the `packageManager` field in `package.json`.

CI uses Node 24.15.0 and the npm version bundled with that pinned runtime.

## Lockfile

`package-lock.json` is committed and uses lockfile version 3.

The lockfile is part of the source contract. Do not delete it or regenerate it casually.

For a clean install of the committed dependency graph, use:

```bash
npm ci
```

`npm ci` fails when `package.json` and `package-lock.json` disagree instead of silently rewriting dependency resolution.

## Adding or updating dependencies

For an intentional dependency change:

```bash
npm install <package>
```

or:

```bash
npm install -D <package>
```

The repository `.npmrc` enables `save-exact=true` for newly added direct dependencies.

Commit both:

```text
package.json
package-lock.json
```

The existing historical semver ranges remain represented in the lockfile, while the resolved graph itself is deterministic.

## CI

GitHub Actions uses:

```bash
npm ci --no-audit --no-fund
```

Dependency installation and vulnerability review are intentionally separate steps.

CI then runs:

```bash
npm run check:dependencies
npm audit --audit-level=high
```

The audit fails the release gate when npm reports a high- or critical-severity vulnerability in the installed dependency graph.

Low/moderate findings still require review during maintenance, but they do not automatically block the frontend release gate.

## Docker

The Docker build copies both manifests before dependency installation:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
```

This provides reproducible dependency layers and allows Docker to reuse the dependency-install layer when application source changes without dependency changes.

## Dependency contract guard

Run:

```bash
npm run check:dependencies
```

The guard verifies:

- `packageManager` remains `npm@11.12.1`
- the lockfile remains version 3
- root dependency declarations match between `package.json` and `package-lock.json`
- CI uses `npm ci`, not `npm install`
- Docker copies the lockfile before installation
- Docker uses `npm ci`, not `npm install`

This is a repository-policy check. npm remains authoritative for validating the full lockfile graph during `npm ci`.

## Dependabot

Dependabot remains enabled for:

- npm dependencies weekly
- Angular packages grouped together
- GitHub Actions monthly

Dependabot changes must update and preserve the lockfile and pass the same CI/audit gates as application changes.

## Supply-chain rule

Do not bypass the lockfile or audit gate to make CI green.

When a vulnerability or dependency conflict appears:

1. identify whether it affects runtime or build tooling
2. update the smallest relevant dependency set
3. review the resulting lockfile diff
4. run the full release gate
5. document any accepted residual risk explicitly
