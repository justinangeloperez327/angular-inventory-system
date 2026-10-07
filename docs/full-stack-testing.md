# Full-Stack Integration Testing

Group 26 adds a real production-path integration gate for the Angular and NestJS inventory systems.

## Purpose

The existing browser suite intentionally mocks the REST boundary so frontend routing, guards, session state, and responsive UI failures remain attributable to Angular.

The full-stack suite answers a different question:

> Can the production Angular container actually authenticate and authorize users against the pinned NestJS backend and PostgreSQL database?

It therefore runs the assembled system rather than replacing the API with Playwright fixtures.

## Stack under test

CI starts:

```text
PostgreSQL 18
      ↓
pinned NestJS migration/seed container
      ↓
pinned NestJS production API container
      ↓
Angular production Nginx container
      ↓
Chromium / Playwright
```

The backend source is the immutable revision recorded in:

```text
contracts/backend-api-contract.json
```

The Angular container uses the same image already built and runtime-verified by the frontend CI job.

## Production proxy path

The Angular browser calls:

```text
http://127.0.0.1:8080/api/v1/...
```

Nginx proxies the request across the Docker integration network to:

```text
http://app:3000/api/v1/...
```

No browser CORS shortcut or direct backend URL is used.

This verifies the same-origin production API topology rather than only proving that the two applications work independently.

## Database and seed

The pinned NestJS Compose stack:

1. starts PostgreSQL
2. applies Prisma production migrations
3. runs the backend seed
4. creates a CI-only bootstrap Administrator
5. starts the production NestJS runtime

The bootstrap values are test-only and scoped to the ephemeral integration database.

The database volume is removed after every run.

## Covered behavior

The Playwright full-stack suite verifies:

1. NestJS readiness is reachable through the Angular Nginx proxy.
2. The bootstrap Administrator signs in through the Angular Sign In page.
3. Angular stores the real backend access token in the existing tab-scoped session contract.
4. A browser reload restores the user through the real `GET /api/v1/auth/me` endpoint.
5. The Angular-facing `GET /api/v1/administration/roles` contract returns the seeded Viewer role.
6. An actual restricted Viewer user can authenticate.
7. The Viewer can access an allowed backend resource such as Dashboard.
8. The backend rejects Viewer access to `/api/v1/administration/roles` with HTTP 403.
9. Angular's `role.manage` route guard independently redirects the same Viewer from `/administration/roles` to Access Denied.
10. Sign Out clears the browser session and protected navigation returns to Sign In.

This gives one test path through both the presentation authorization boundary and the authoritative backend authorization boundary.

## Commands

The browser-only integration suite is:

```bash
npm run e2e:full-stack
```

It expects the production frontend and backend stack to already exist.

The complete orchestration is:

```bash
bash scripts/run-full-stack-integration.sh
```

Before running locally:

1. check out the pinned backend into `.contract-backend/`
2. install frontend dependencies
3. install Playwright Chromium
4. build the frontend image as `angular-inventory-system:ci`

For example:

```bash
docker build -t angular-inventory-system:ci .
bash scripts/run-full-stack-integration.sh
```

CI already performs the pinned backend checkout and frontend image build.

## Failure diagnostics

If the full-stack test fails, the orchestration script prints:

- Angular Nginx container logs
- NestJS/PostgreSQL/migration Compose logs

Playwright also retains its configured trace, screenshot, and video artifacts on browser failures.

All integration containers and the PostgreSQL volume are removed by the script's EXIT trap.

## Separation from mocked E2E

Both suites are required.

### Mocked browser E2E

```text
Angular + deterministic API fixtures
```

Best for:

- route guards
- client validation
- responsive navigation
- frontend failure attribution
- deterministic UI behavior

### Full-stack E2E

```text
Angular production image + NestJS production image + PostgreSQL
```

Best for:

- real login
- real bearer token flow
- session restoration
- Nginx API proxy wiring
- backend RBAC
- frontend/backend permission agreement
- migrations and seed compatibility

One suite must not replace the other.

## Reproducibility boundary

The backend repository revision itself is pinned by commit SHA.

The current pinned backend Docker build still follows that repository's own dependency-install strategy. Full-stack CI does not silently change the backend dependency policy; backend dependency reproducibility should be strengthened in the backend repository independently.

## Deployment boundary

Passing this test proves the repository-controlled production containers integrate correctly.

It still does not prove that an external CDN, ingress, WAF, DNS, TLS termination layer, or hosted deployment preserves the same behavior.

Final deployed-origin verification remains a separate production requirement.
