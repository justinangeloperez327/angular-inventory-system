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
npm install
npm start
```

Then open:

```text
http://localhost:4200
```

The default API base URL is same-origin:

```text
/api
```

Configure the development reverse proxy/hosting path to the NestJS backend as appropriate for your environment.

## Verification

```bash
npm run check:design
npm test
npm run build:production
```

Or run the complete release gate:

```bash
npm run check
```

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

The visual layer uses:

```text
Tailwind CSS v4
+
Angular CDK / Angular Aria
+
custom Angular UI components
```

Application components do not create feature-level stylesheet files. New components are scaffolded without a stylesheet and CI enforces the Tailwind-only component model.

See `docs/design-system.md` for semantic tokens, component rules, and the design-system guard.

## Docker

Build and run the production container:

```bash
docker compose up --build
```

The frontend is available at `http://localhost:8080` and proxies `/api` to the runtime `API_UPSTREAM`.

See `docs/docker.md` for standalone Docker, Compose, health checks, caching, reverse-proxy behavior, and backend-network configuration.

## Production

See:

- `docs/design-system.md`
- `docs/docker.md`
- `docs/production-hardening.md`
- `docs/http-infrastructure.md`
- `docs/authentication.md`
- `docs/authorization.md`

Production builds use hashed output and Angular CLI automatic CSP script hardening. Hosting infrastructure remains responsible for HTTPS, SPA fallback routing, security response headers, and the `/api` backend route.
