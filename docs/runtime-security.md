# Runtime Security Verification

Group 23 verifies the production Docker/Nginx runtime as an HTTP system rather than trusting configuration files alone.

## Static runtime guard

Run:

```bash
npm run check:runtime
```

The static guard verifies that the repository retains:

- Node 24.15.0 as the validated Docker build runtime
- lockfile-backed `npm ci`
- container health check on `/healthz`
- Nginx version-token suppression
- the shared security-header include
- explicit `/healthz`
- `/api/` reverse proxy separation
- SPA fallback to `index.html`
- no-store caching for `index.html`
- immutable one-year caching for generated JavaScript/CSS
- the required security headers and CSP directives

This guard catches configuration drift before the image is built.

## Live container verifier

CI builds the production image, starts it on port 8080, and runs:

```bash
bash scripts/verify-container-runtime.sh
```

The verifier performs real HTTP requests against the running Nginx container.

### Health

```text
GET /healthz
200 OK
ok
```

The response must also carry the production security-header policy.

### Security headers

The running container must emit:

```text
X-Content-Type-Options: nosniff
Referrer-Policy: same-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
X-Frame-Options: DENY
```

The complementary CSP must retain framing protection and the Angular `angular` / `angular#bundler` Trusted Types policy allowlist. It must not enforce `require-trusted-types-for 'script'` while the validated Angular `autoCsp` bootstrap loader assigns string script URLs before Angular initializes its own policies.

The `Server` response header must not disclose an Nginx version.

### Production browser bootstrap

Group 26 adds an actual Chromium run against the production Nginx image. This is required because HTTP-only checks can prove that HTML and JavaScript files are served while still missing a browser security-policy failure during application bootstrap.

The guard specifically protects the compatibility between Angular CLI `security.autoCsp` and the HTTP CSP. A prior `require-trusted-types-for 'script'` directive blocked the autoCSP loader before Angular rendered the application; the full-stack browser test detects that class of failure.

### SPA fallback

A frontend path such as:

```text
/products
```

must return the Angular application and inherit the non-cacheable HTML policy.

This proves refresh/deep-link routing in the actual container.

### API separation

A request under the application contract:

```text
/api/v1/
```

must never return Angular `index.html`.

The CI runtime intentionally points `API_UPSTREAM` at an unavailable local backend; the expected `/api/v1/...` request fails upstream instead of falling back to the SPA. The exact upstream failure status is not treated as the contract—the separation from Angular routing is.

### Asset caching

The verifier discovers a generated JavaScript or CSS asset from the built `index.html` and confirms:

```text
max-age=31536000
immutable
```

This validates the actual Nginx cache policy against hashed Angular output.

## Build identity

The Docker build accepts `APP_COMMIT_SHA` and `APP_BUILD_ID`, and CI populates them from the GitHub commit/run identifiers.

The Angular build generates `/build-info.json` from those safe values. The runtime verifier confirms the endpoint contains a valid application name, Angular version, commit SHA, and build ID.

See `docs/observability.md`.

## Deployment boundary

Passing the container verifier proves the repository's Nginx image behaves as intended.

It does not prove that an external CDN, ingress, reverse proxy, WAF, or hosting platform preserves those headers. Production deployment should still verify the final public HTTPS origin after infrastructure is configured.

HSTS remains an ingress/domain decision and is intentionally not forced by the application container.


## Public deployed-origin verification

Container verification proves the repository-controlled Nginx runtime.

Group 27 adds a separate public-origin verification step because a deployment platform, CDN, ingress, WAF, or DNS/TLS layer can still alter the final response.

The production workflow validates the public HTTPS origin for:

- security headers
- CSP compatibility
- HTTPS redirect
- health
- build identity
- SPA deep links
- asset caching
- backend readiness through `/api/v1`
- real Chromium bootstrap

See `docs/deployed-origin-verification.md`.
