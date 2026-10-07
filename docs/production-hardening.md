# Production Hardening

Production readiness is verified by executing the application and its deployment boundaries rather than maintaining duplicate scripts that regex-check configuration text.

## Local release gate

Use a supported Node.js version, install from the lockfile, then run:

```bash
npm ci
npm run check
```

The local release gate runs:

1. Angular ↔ NestJS API-contract validation
2. design-system guard
3. baseline accessibility guard
4. Vitest unit tests
5. Angular production build
6. mocked-boundary Playwright browser E2E

The production build itself enforces Angular compiler diagnostics and bundle budgets configured in `angular.json`.

## CI

GitHub Actions adds the infrastructure and integration checks that require Docker or the pinned backend:

1. deterministic `npm ci`
2. high/critical npm vulnerability audit
3. pinned NestJS backend checkout
4. frontend/backend route and verb contract validation
5. design-system and accessibility guards
6. unit tests
7. production build
8. browser E2E
9. production Docker image build
10. live Nginx/container verification
11. Angular + NestJS + PostgreSQL full-stack integration

The live container verifier checks real HTTP responses for health, routing, security headers, cache behavior, build identity, SPA fallback, and API separation.

## Build identity

Start, test, watch, and production build workflows generate:

```text
src/app/core/observability/build-info.generated.ts
public/build-info.json
```

These are generated build artifacts and are intentionally ignored by Git.

CI supplies:

```text
APP_COMMIT_SHA = GITHUB_SHA
APP_BUILD_ID    = GITHUB_RUN_ID
```

The production runtime exposes the resulting identity at `/build-info.json` with `Cache-Control: no-store`.

## Dependency and API integrity

The committed `package-lock.json` and `npm ci` provide dependency reproducibility. CI separately runs `npm audit --audit-level=high`.

The Angular client targets the pinned NestJS contract recorded in `contracts/backend-api-contract.json`. `npm run check:api-contract` compares frontend calls with the pinned backend controllers in CI.

## Runtime security

The Docker/Nginx runtime is tested by:

```bash
bash scripts/verify-container-runtime.sh
```

The verifier confirms:

- `/healthz` serves the expected response
- production security headers are emitted
- the Nginx version is not disclosed
- `index.html` is non-cacheable
- generated JS/CSS is immutable-cacheable
- deep SPA routes return Angular
- `/api/v1` never falls through to the SPA
- `/build-info.json` contains valid build identity

Angular CLI `security.autoCsp` remains enabled. The HTTP CSP allowlists Angular's `angular` and `angular#bundler` Trusted Types policies but intentionally does not enforce `require-trusted-types-for 'script'` with the currently validated Angular 22 bootstrap path.

## Full-stack integration

`scripts/run-full-stack-integration.sh` runs the production frontend image against the pinned NestJS backend and an ephemeral PostgreSQL database.

This verifies real authentication/session restoration, backend readiness through the frontend proxy, authorization agreement, and logout behavior.

See `docs/full-stack-testing.md`.

## Deployed-origin verification

Repository CI cannot prove that a CDN, hosting platform, TLS layer, rewrite, or production cache preserves the same behavior.

After deployment run the manual **Verify deployed origin** GitHub Actions workflow. It executes the public HTTP verifier and deployed Chromium smoke test against the intended HTTPS origin and expected commit.

See `docs/deployed-origin-verification.md`.

## Release criteria

A production release requires:

- dependency audit green
- API contract green
- design/accessibility checks green
- unit tests green
- production build within bundle budgets
- browser E2E green
- Docker runtime verification green
- full-stack integration green
- intended deployed origin verified against the expected commit

Do not replace a failing behavioral check with a static text check. Fix the owning layer.
