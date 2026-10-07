# Docker

The Angular frontend is packaged as a multi-stage production image:

```text
Node.js build stage
        ↓
Angular production build
        ↓
Nginx runtime image
        ↓
Static SPA + /api/v1 backend route through /api/ reverse proxy
```

## Build

From the repository root:

```bash
docker build -t angular-inventory-system .
```

## Run against a NestJS backend on the host

Docker Desktop:

```bash
docker run --rm \
  -p 8080:8080 \
  -e API_UPSTREAM=http://host.docker.internal:3000 \
  angular-inventory-system
```

Open:

```text
http://localhost:8080
```

The Angular application calls the versioned same-origin backend path:

```text
/api/v1
```

Nginx's broader `/api/` location proxies `/api/v1/...` unchanged to `API_UPSTREAM`.

## Docker Compose

Copy the example environment file if you want to override the default:

```bash
cp .env.docker.example .env
docker compose up --build
```

On Windows PowerShell:

```powershell
Copy-Item .env.docker.example .env
docker compose up --build
```

The default Compose configuration expects the NestJS backend to be running on the Docker host at port 3000.

## Running both frontend and backend in Docker

When the NestJS repository is containerized, put both services on the same Compose network and set:

```text
API_UPSTREAM=http://api:3000
```

where `api` is the NestJS Compose service name.

The frontend image does not need to be rebuilt when this upstream changes.

## Build identity

The build stage accepts optional safe metadata:

```text
APP_COMMIT_SHA
APP_BUILD_ID
```

CI supplies the GitHub commit SHA and workflow run ID. The Angular build writes that identity to `/build-info.json`, which is served with `Cache-Control: no-store`.

Example manual build:

```bash
docker build \
  --build-arg APP_COMMIT_SHA=0123456789abcdef \
  --build-arg APP_BUILD_ID=manual-1 \
  -t angular-inventory-system .
```

If the build arguments are omitted, local/default metadata uses `development` and `local`.

See `docs/observability.md`.

## Runtime port

The container listens on:

```text
8080
```

This avoids requiring a privileged port inside the container.

## Health check

The image exposes:

```text
GET /healthz
```

Expected response:

```text
200 OK
ok
```

The health endpoint checks that Nginx and the static frontend container are serving. It does not assert that the NestJS backend or database are healthy.

Backend health should be monitored independently.

## SPA routing

Nginx uses an `index.html` fallback for non-file frontend routes, so URLs such as:

```text
/products
/inventory
/purchasing
/reports
/administration
```

continue to work after browser refresh.

The `/api/` location is evaluated separately and is never rewritten to the Angular application.

## Caching

The runtime configuration uses:

- no-store for `index.html`
- immutable one-year caching for hashed JavaScript and CSS
- seven-day caching for static images/fonts
- SPA fallback for application routes

Angular production output hashing makes the long-lived JS/CSS cache safe.

## Security

The Nginx runtime adds:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: same-origin`
- restrictive `Permissions-Policy`
- `Cross-Origin-Opener-Policy: same-origin`
- clickjacking protection
- a complementary CSP for styles, connections, objects, framing, forms, and Trusted Types

Angular's production build still provides its generated automatic script CSP.

TLS termination should normally happen at the ingress/reverse-proxy/load-balancer layer. Enable HSTS there only after the HTTPS/domain policy is confirmed.

## API forwarding

The proxy preserves:

- host
- client IP
- forwarded-for chain
- forwarded protocol

The NestJS application should configure trusted-proxy handling according to the actual deployment topology.

## Image reproducibility

The repository commits `package-lock.json` and the Docker build uses:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
```

The dependency layer is therefore resolved from the same lockfile used by CI.

See `docs/dependencies.md` for the dependency-management contract.

For formal production releases, the runtime Nginx base image should also be pinned to an approved version or digest according to the deployment team's image-maintenance policy.

## CI runtime verification

CI builds and starts the Docker image after the Angular unit, production-build, and browser gates.

The running image is verified directly with:

```bash
bash scripts/verify-container-runtime.sh
```

The live verifier checks:

- Nginx becomes healthy
- generated build identity is available at `/build-info.json` with no-store caching
- `/healthz` returns the expected body
- production security headers are actually emitted
- the Nginx version is not exposed
- `index.html` is not cacheable
- a deep SPA route resolves to Angular
- `/api/v1/` never falls through to Angular
- a generated JS/CSS asset has immutable one-year caching

The test deliberately does not require a live NestJS backend. In CI, an API request is expected to fail upstream while remaining clearly separated from the SPA.

See `docs/production-hardening.md`.
