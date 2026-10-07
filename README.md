# Angular Inventory System

Operational inventory-management frontend built with Angular 22.

## Stack

- Angular 22.2.1
- TypeScript 6
- RxJS
- Standalone Angular APIs
- Angular Router
- Tailwind CSS v4 design-system utilities
- Angular CDK accessibility primitives
- Custom Angular UI components
- Vitest + jsdom
- Playwright

The frontend consumes the separate NestJS inventory-system REST API.

## Requirements

Angular 22 supports:

```text
Node.js ^22.22.3 || ^24.15.0 || ^26.0.0
TypeScript >=6.0.0 <6.1.0
```

The repository CI uses Node 24.15.0.

## Development

```bash
npm ci
npm start
```

Then open:

```text
http://localhost:4200
```

The default API base URL is same-origin and versioned to match the NestJS contract:

```text
/api/v1
```

Configure the development reverse proxy/hosting path to the NestJS backend as appropriate for your environment.

## Verification

The normal local release gate is:

```bash
npm run check
```

It runs the backend API-contract check, design-system/accessibility guards, unit tests, production build, and mocked-browser E2E.

Additional integration and deployment checks:

```bash
npm run e2e:full-stack
npm run verify:deployed-origin
npm run e2e:deployed
```

Install Chromium once before running Playwright locally:

```bash
npx playwright install chromium
```

CI additionally builds the production Docker image, verifies its live HTTP behavior, and runs the Angular + NestJS + PostgreSQL full-stack integration.

## Architecture

Feature-oriented standalone Angular architecture:

```text
src/app/
├── core/
├── shared/
└── features/
    ├── auth/
    ├── dashboard/
    ├── products/
    ├── master-data/
    ├── suppliers/
    ├── inventory/
    ├── inventory-adjustments/
    ├── inventory-transfers/
    ├── stock-movements/
    ├── purchasing/
    ├── receiving/
    ├── stock-counts/
    ├── customers/
    ├── sales/
    ├── reports/
    └── administration/
```

Inventory balances are consequences of authoritative backend transactions. Angular does not directly mutate inventory state.

## Design system

The visual layer uses Tailwind CSS v4, Angular CDK/Aria, and custom Angular UI components. Application components do not create feature-level stylesheet files; shared primitives and Tailwind utilities provide the visual system.

See `docs/design-system.md`.

## Generated build metadata

`npm start`, `npm test`, watch builds, and production builds generate:

```text
src/app/core/observability/build-info.generated.ts
public/build-info.json
```

These files are build artifacts and are intentionally ignored by Git.

## Docker

Build and run the production container:

```bash
docker compose up --build
```

The frontend is available at `http://localhost:8080` and proxies `/api/v1` through the runtime `/api/` reverse-proxy boundary to `API_UPSTREAM`.

See `docs/docker.md`.

## Production documentation

Start with:

- `docs/architecture.md`
- `docs/design-system.md`
- `docs/api-integration.md`
- `docs/authentication.md`
- `docs/authorization.md`
- `docs/browser-testing.md`
- `docs/full-stack-testing.md`
- `docs/deployed-origin-verification.md`
- `docs/dependencies.md`
- `docs/observability.md`
- `docs/production-hardening.md`

Production builds use hashed output and Angular CLI automatic CSP script hardening. Hosting infrastructure remains responsible for HTTPS, SPA fallback routing, security response headers, and the `/api/v1` backend route.
