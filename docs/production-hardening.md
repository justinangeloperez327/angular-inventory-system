# Production Hardening

Group 26 adds production-container Angular ↔ NestJS ↔ PostgreSQL integration verification to the frontend release gate.

## Verification commands

Use a Node.js version supported by Angular 22:

```text
^22.22.3 || ^24.15.0 || ^26.0.0
```

The repository pins the CI runtime to Node 24.15.0.

Run:

```bash
npm ci
npm run check
```

`npm run check` executes the isolated frontend dependency, backend API-contract, design-system, accessibility, production, runtime-configuration, and observability guards, Vitest unit tests, the Angular production build, and mocked-boundary Playwright browser E2E. CI additionally runs the Docker-backed full-stack integration gate.

## CI

GitHub Actions runs on pushes to `main` and pull requests.

The workflow performs:

1. deterministic `npm ci` installation from the committed lockfile
2. dependency-contract validation
3. high/critical npm vulnerability audit
4. pinned NestJS backend contract checkout
5. Angular ↔ NestJS route/verb compatibility guard
6. Playwright Chromium installation
7. design-system guard
8. accessibility guard
9. production-configuration guard
10. runtime/Nginx configuration guard
11. observability/redaction/build-identity guard
12. Vitest unit tests
13. Angular production build with generated build metadata
14. Playwright critical-flow browser E2E
15. Docker image build with commit/run identity
16. live container security/routing/cache/build-identity verification
17. production-container Angular ↔ NestJS ↔ PostgreSQL full-stack integration

Production bundle budgets are enforced by the Angular builder. See `docs/performance.md` for the measured baseline and ceilings.



## Dependency reproducibility and supply chain

The repository commits `package-lock.json` and records `npm@11.12.1` as the package manager.

CI and Docker use `npm ci`; neither is allowed to resolve a fresh dependency graph with `npm install`.

`npm run check:dependencies` verifies the lockfile/package manifest contract and the deterministic install configuration.

CI separately runs:

```bash
npm audit --audit-level=high
```

High and critical npm advisories therefore block the frontend release gate.

See `docs/dependencies.md`.



## Backend API compatibility

The Angular application now pins a compatible NestJS backend revision and verifies its API surface in CI.

Current contract:

```text
NestJS repository  justinangeloperez327/nest-js-inventory-system
Backend commit     fdb4387c9317e09b691e540f1b8f2a7bea0a49e4
API prefix         /api/v1
```

`npm run check:api-contract` validates the Angular environment base path and CI pin locally. In CI it additionally compares every discovered Angular `ApiClient` method/path against the HTTP decorators in the pinned NestJS controllers.

This prevents the frontend and backend from independently passing tests while drifting at the REST boundary.

See `docs/api-integration.md`.



## Full-stack authentication and authorization

Group 26 runs the production Angular Nginx image against the pinned NestJS backend and an ephemeral PostgreSQL 18 database.

The integration gate:

- applies the backend's real Prisma migrations
- runs the real backend seed
- creates a CI-only Administrator
- verifies backend readiness through the Angular Nginx proxy
- signs in through the Angular UI against the live NestJS login endpoint
- reloads the browser to verify real `/auth/me` session restoration
- exercises the Angular-facing Administration role contract
- creates and signs in a restricted Viewer through the live backend
- verifies an allowed Dashboard request
- verifies backend HTTP 403 enforcement for `role.manage`
- verifies Angular's route guard independently produces Access Denied
- verifies logout clears the browser session

This closes the repository-controlled authentication/authorization end-to-end requirement.

The test still does not validate an external hosting layer, CDN, ingress, WAF, TLS terminator, or DNS path. Deployed-origin verification remains separate.

See `docs/full-stack-testing.md`.

## Build cleanliness and performance

Angular extended diagnostics are promoted to errors, so compiler-detectable template issues cannot remain as accepted production warnings.

The production build currently uses these primary bundle ceilings:

```text
initial   warning 360 kB / error 400 kB
anyScript warning 170 kB / error 200 kB
```

`npm run check:production` also protects source-map, output-hashing, automatic-CSP, diagnostic, and bundle-budget configuration from being silently loosened.

See `docs/performance.md`.

## Unit testing

Angular's unit-test builder is configured with Vitest and jsdom.

The first release-gate tests cover:

- environment validation
- HTTP query serialization
- API error normalization / trace IDs

Feature-specific tests should be added alongside future changes rather than growing one centralized test file.

## Content Security Policy

Production builds enable Angular CLI `security.autoCsp`.

This hashes the inline scripts generated by the Angular build. Hosting infrastructure still needs its own response headers because meta-based CSP cannot enforce every directive.

For static hosting with `autoCsp`, configure an additional CSP header without `default-src` or `script-src` so it does not conflict with Angular's generated script policy.

A suitable starting point for the current same-origin deployment is:

```text
Content-Security-Policy:
  style-src 'self' 'unsafe-inline';
  connect-src 'self';
  img-src 'self' data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
  form-action 'self';
  trusted-types angular angular#bundler
```

If the API is moved away from the same-origin `/api/v1` contract, explicitly add the approved HTTPS API origin to `connect-src`.

Do not hard-code a reusable CSP nonce.

### Angular autoCSP and Trusted Types

The production header allowlists Angular's `angular` and `angular#bundler` Trusted Types policy names, but it intentionally does **not** send:

```text
require-trusted-types-for 'script'
```

Angular CLI `security.autoCsp` replaces external script tags with a hashed bootstrap loader. In the Angular 22 toolchain used by this repository, that loader assigns string URLs to dynamically created script elements before Angular's own Trusted Types policies exist. Enforcing the Trusted Types script sink in the HTTP header therefore blocks application bootstrap with `TrustedScriptURL` errors.

The full-stack production-browser gate protects this boundary. Keep `security.autoCsp` enabled; do not re-add sink enforcement until the validated Angular CLI bootstrap path supports it.

## Recommended HTTP headers

Production hosting should also send:

```text
X-Content-Type-Options: nosniff
Referrer-Policy: same-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
```

Use `Strict-Transport-Security` only at an HTTPS origin where the deployment team has confirmed the correct domain/subdomain policy.



## Runtime security verification

The repository now validates both the Nginx configuration and the behavior of the running production image.

`npm run check:runtime` statically protects the Docker/Nginx contract, including security headers, SPA fallback, API proxy separation, health checks, and caching rules.

After the Docker image is built, CI starts the image and runs:

```bash
bash scripts/verify-container-runtime.sh
```

The live verifier confirms:

- health endpoint behavior
- security headers on real HTTP responses
- Nginx version suppression
- non-cacheable HTML
- immutable hashed JS/CSS caching
- frontend deep-link fallback
- `/api/` never falling through to Angular

This closes the gap between "configuration exists" and "the shipped container actually emits the expected runtime behavior."

The final deployed HTTPS origin still requires infrastructure-level verification because an ingress, CDN, WAF, or hosting platform can alter response headers.

See `docs/runtime-security.md`.

## Authentication storage

The current frontend contract uses a bearer access token stored in tab-scoped `sessionStorage`, with an in-memory fallback.

This is preferable to persistent local storage but it is still readable by JavaScript. CSP, Angular template sanitization, the allowed Angular Trusted Types policies, and avoiding unsafe DOM APIs are therefore important.

For a higher-assurance production architecture, the backend can move session/refresh credentials to `HttpOnly; Secure; SameSite` cookies. That is a backend authentication change and should not be simulated only in Angular.

If cookie authentication is adopted, review Angular XSRF configuration and the backend CSRF policy together.

## Environment validation

Startup validates:

- `apiBaseUrl` is present
- absolute API URLs use HTTP(S)
- production absolute API URLs use HTTPS

The default production endpoint remains same-origin and matches the pinned NestJS API version:

```text
/api/v1
```

No credentials, API secrets, or environment-specific private values belong in Angular environment files because browser bundles are public.

## Accessibility

Release hardening adds:

- keyboard-accessible skip navigation
- semantic main landmark
- modal focus trapping
- modal Escape-key close
- programmatic dialog label/description association
- form error/hint ARIA association
- assertive live region behavior for danger alerts
- reduced-motion handling

Accessibility is an ongoing acceptance criterion. New interactive UI must remain keyboard reachable and expose a programmatic name/state.

## Errors and observability

Group 24 provides a sanitized frontend diagnostic event contract and a custom Angular `ErrorHandler`.

Uncaught application errors and operational API failures can emit metadata such as:

- diagnostic event ID
- build identity
- HTTP status
- identifier-safe backend code
- trace/request ID
- JavaScript error type

Diagnostic events intentionally exclude raw error messages, validation payloads, request/response bodies, authentication credentials, user identity, and business payloads.

API correlation uses backend trace identity when available and falls back to the outbound client `X-Request-ID`.

Every build also generates safe frontend identity metadata and exposes it from the production runtime at:

```text
/build-info.json
```

The endpoint is served with `Cache-Control: no-store` and is validated by the live Docker runtime test.

The default diagnostic sink is local browser console output of the sanitized event only. No remote telemetry endpoint is invented. A future approved integration should replace only the `CLIENT_DIAGNOSTIC_SINK` token while preserving the redaction contract.

See `docs/observability.md`.

Never include access tokens, passwords, authorization headers, user/session data, or sensitive business payloads in client telemetry.

## Deployment requirements

The repository includes a production Docker/Nginx runtime. See `docs/docker.md`.

Whether containerized or hosted directly, the hosting platform must:

- serve the production `dist` output
- route non-file application paths back to `index.html`
- serve only over HTTPS
- proxy or route `/api/v1` through the `/api/` reverse-proxy boundary to the NestJS backend
- preserve API status codes
- set the production security headers
- use immutable caching for hashed JS/CSS assets
- avoid long-lived caching for `index.html`

## Search indexing

The application includes both a `robots.txt` deny rule and `noindex` metadata because this is an authenticated operational system.

These are privacy/search-engine hints, not access controls.

## Release gate

Frontend release readiness requires:

- committed lockfile and deterministic dependency contract green
- pinned Angular ↔ NestJS API contract guard green
- high/critical npm vulnerability audit green
- design-system guard green
- accessibility guard green
- production configuration guard green
- runtime/Nginx configuration guard green
- observability/redaction/build-identity guard green
- Vitest unit tests green
- warning-clean Angular production build within configured bundle ceilings
- Playwright critical-flow browser E2E green
- Docker image build and live runtime security/routing/cache/build-identity verification green
- no unresolved critical/high dependency vulnerabilities after review
- backend contracts implemented and integration-tested ✅ Group 25–26
- authentication/authorization verified end-to-end ✅ Group 26
- production security headers verified at the deployed origin
- frontend application/Angular/build identity available from `/build-info.json`
- API/Angular versions and deployment configuration documented
