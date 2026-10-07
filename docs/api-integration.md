# Angular ↔ NestJS API Integration

Group 25 makes the frontend/backend compatibility boundary explicit and testable.

## Compatible backend

The Angular repository pins the backend contract in:

```text
contracts/backend-api-contract.json
```

Current compatibility target:

```text
Repository  justinangeloperez327/nest-js-inventory-system
Commit      fdb4387c9317e09b691e540f1b8f2a7bea0a49e4
API prefix  /api/v1
Backend     0.0.1
```

This pin is a compatibility reference, not a deployment mechanism.

## API base URL

Both Angular environments use:

```text
/api/v1
```

Feature services continue to use relative resource paths such as:

```text
auth/login
products
purchase-orders/:id/approve
sales-orders/:id/dispatch
```

`ApiClient` joins those paths to the configured base.

The production Nginx container still owns the broad `/api/` proxy location, so the versioned `/api/v1/...` requests pass through unchanged to NestJS.

## Why the contract is pinned

Before Group 25, Angular used `/api` while the NestJS backend used a global `/api/v1` prefix.

Both repositories could therefore pass their own tests while failing when connected together.

The backend pin makes compatibility review intentional:

```text
Angular change
      ↓
frontend API route extraction
      ↓
pinned NestJS controller extraction
      ↓
HTTP method + normalized route comparison
```

## Contract guard

Run:

```bash
npm run check:api-contract
```

Locally, without the backend checkout, the guard verifies:

- development API prefix
- production API prefix
- compatibility metadata
- CI backend repository/ref/path configuration

In CI, the workflow additionally checks out the pinned NestJS commit into:

```text
.contract-backend/
```

The guard then:

1. confirms the backend package version
2. confirms the backend default `apiPrefix`
3. discovers Angular `*api.service.ts` files
4. extracts `ApiClient` GET/POST/PUT/PATCH/DELETE/getBlob calls
5. normalizes dynamic route parameters
6. discovers NestJS `*.controller.ts` files
7. extracts controller + HTTP method route decorators
8. fails when Angular calls a method/path not provided by the pinned backend

The comparison treats route parameter names as structural placeholders, so `:id` and `:productId` are equivalent when they occupy the same route position.

## Backend HTTP contract tests

The pinned NestJS revision contains its own HTTP E2E suite covering the shared protocol boundary, including:

- `/api/v1/health`
- `/api/v1/health/ready`
- request-ID preservation
- standardized error envelopes
- login validation
- successful login session response

Group 25 does not reinstall the backend inside Angular CI because that backend revision does not commit an npm lockfile. Angular's release pipeline does not weaken its deterministic-install policy by introducing an unpinned `npm install`.

The Angular CI contract check therefore validates source-level route compatibility against the exact backend commit, while the NestJS repository remains responsible for executing its backend-specific tests.

## Authentication boundary

The shared authentication endpoints are:

```text
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

The backend also provides:

```text
POST /api/v1/auth/refresh
```

The Angular frontend does not currently persist or automatically rotate refresh tokens. Refresh-token support should be introduced only as a coordinated authentication change.

## Updating the backend pin

When intentionally moving Angular to a newer NestJS revision:

1. update `contracts/backend-api-contract.json`
2. update the backend checkout `ref` in CI
3. run the API contract guard
4. review every reported route/verb drift
5. run the full Angular release gate
6. verify the target backend revision's own CI/tests
7. document any intentional contract changes

Do not point CI at an unpinned backend branch such as `main`; compatibility checks must remain reproducible.

## Scope

This guard proves route/verb compatibility and the shared versioned base path.

It does not prove database state, transactional business rules, or production infrastructure connectivity. Those remain backend/integration/deployment responsibilities.
