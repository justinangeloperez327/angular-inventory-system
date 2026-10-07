# Deployed-Origin Verification

Group 27 verifies the final public HTTPS origin after the repository-controlled Angular, Nginx, NestJS, PostgreSQL, and browser integration gates have already passed.

This is the final deployment boundary.

## Why this is separate from CI

Normal CI proves the source tree and repository-controlled containers are correct.

A hosting platform can still change:

- routing
- security headers
- cache policy
- redirects
- public build version
- API proxying
- TLS behavior
- SPA deep-link handling

The deployed-origin workflow therefore runs separately against the actual public origin.

A temporary hosting outage, deployment queue, or provider build-rate limit should not be confused with a source-code regression, but the application is not release-ready until the public-origin verification passes.

## Current production origins

Frontend:

```text
https://angular-inventory-system.vercel.app
```

Backend:

```text
https://nest-js-inventory-system.vercel.app
```

The frontend Vercel configuration proxies:

```text
/api/v1/:path*
```

to the canonical backend production origin.

The browser continues to use same-origin URLs.

## Manual-only Vercel deployment

This repository does **not** automatically deploy from Git pushes or merged pull requests.

`vercel.json` enforces:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

This keeps the Vercel project available while stopping Git-triggered Preview and Production deployments.

Deploy to Vercel only when intentionally requested, for example through an explicit manual Vercel deployment workflow or the Vercel CLI.

The deployed-origin verification workflow does not create a deployment; it only verifies an already-deployed origin.

## Vercel deployment policy

`vercel.json` mirrors the validated Docker/Nginx contract where the platform controls delivery:

- global security headers
- Content Security Policy compatible with Angular CLI autoCSP
- no `require-trusted-types-for 'script'` header until the validated Angular bootstrap supports it
- non-cacheable `index.html`
- non-cacheable `build-info.json`
- non-cacheable `healthz`
- immutable one-year JS/CSS browser caching
- no Vercel rewrite caching for `/api/v1`
- external rewrite from the frontend origin to the canonical NestJS production origin

The platform-specific policy complements the platform-neutral verification script.


## HTTP verification

Run:

```bash
DEPLOYED_ORIGIN=https://angular-inventory-system.vercel.app \
EXPECTED_COMMIT_SHA=<commit> \
npm run verify:deployed-origin
```

The verifier requires an HTTPS origin and checks:

1. HTTP redirects to HTTPS.
2. Root application returns HTTP 200 and the Angular root element.
3. Required production security headers are present.
4. CSP retains the validated restrictions and does not reintroduce the incompatible Trusted Types sink enforcement.
5. Server headers do not disclose a version.
6. `/healthz` returns `ok` with no-store caching.
7. `/build-info.json` is non-cacheable and exposes valid application/build metadata.
8. The deployed commit matches the expected commit when one is supplied.
9. `/products` deep-links to Angular rather than a hosting-platform 404.
10. Generated JS/CSS uses immutable one-year caching.
11. `/api/v1/health/ready` reaches the real NestJS backend and reports the database healthy.

The verifier writes:

```text
deployment-verification-report.json
```

with every check and the observed build identity.

## Browser verification

Run:

```bash
DEPLOYED_ORIGIN=https://angular-inventory-system.vercel.app \
npm run e2e:deployed
```

The Chromium check verifies:

- the real deployed `/auth/login` page bootstraps successfully
- Email and Password controls render
- no uncaught page error occurs during bootstrap
- direct navigation to `/products` returns HTTP 200
- Angular routes the anonymous user to Sign In with the expected return URL

This specifically protects against production-only CSP, CDN, routing, asset, or bootstrap failures.

## GitHub production workflow

Use:

```text
Actions → Verify deployed origin → Run workflow
```

Inputs:

- `origin` — public HTTPS origin to verify
- `expected_commit` — optional expected deployed SHA; defaults to the selected workflow ref
- `require_hsts` — optionally require `Strict-Transport-Security`

The job uses the GitHub `production` environment and read-only repository permissions.

No application credentials are required because the deployed-origin gate tests public bootstrapping, infrastructure policy, build identity, and backend readiness rather than signing in as a user.

## HSTS

HSTS is optional in the verifier because its policy affects the entire public domain and potentially subdomains.

Enable `require_hsts` only after the deployment owner has confirmed the intended domain/subdomain policy.

HTTPS redirect verification is always required.

## Release decision

A production release is considered externally verified only when:

- repository CI is green
- full-stack Group 26 integration is green
- the intended production deployment reports the expected commit
- the deployed-origin HTTP verification passes
- the deployed-origin Chromium verification passes

A failed production-origin workflow means the release remains blocked even when source CI is green.

Typical failures should be classified as:

```text
stale deployment
hosting/build queue
DNS/TLS
security-header drift
SPA routing
cache policy
API proxy
backend readiness
production browser bootstrap
```

Fix the owning layer instead of weakening the verification rule.
