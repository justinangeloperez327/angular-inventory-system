# Frontend Observability

Group 24 establishes a safe frontend diagnostics contract without coupling the application to a telemetry vendor or inventing a backend ingestion endpoint.

## Goals

The frontend must provide enough metadata to correlate production failures while avoiding accidental disclosure of application/user data.

The diagnostics layer therefore records metadata only.

## Diagnostic event shape

A diagnostic event can contain:

- generated diagnostic event ID
- timestamp
- event kind
- severity
- frontend application/build identity
- JavaScript error type/name
- HTTP status
- backend error code when it is identifier-safe
- trace/request ID when it is identifier-safe

It deliberately does **not** contain:

- error messages
- request or response bodies
- validation payloads
- access/refresh tokens
- authorization headers
- passwords
- email/user identity
- form values
- inventory/customer/supplier/business payloads

Identifiers are accepted only when they match a constrained character set and length.

## Global errors

Angular browser-global error listeners remain enabled:

```text
provideBrowserGlobalErrorListeners()
```

The application replaces Angular's default raw error logger with `AppErrorHandler`.

Uncaught browser/application errors are converted into the sanitized diagnostic event contract before reaching the diagnostic sink.

This prevents production logging from automatically serializing arbitrary `Error.message` content.

## API failures

The HTTP error interceptor reports only operational failures:

```text
network failure (status 0)
429 throttling
5xx server failures
```

Expected client/business outcomes such as 400, 401, 403, 404, 409, and 422 remain user/application-flow concerns and are not automatically emitted as diagnostics.

### Trace correlation

Every API request receives an `X-Request-ID` when one is not already present.

When an API failure is normalized, trace identity follows this precedence:

1. backend `traceId`
2. backend `trace_id`
3. response `X-Request-ID`
4. outbound client `X-Request-ID`

This preserves a useful correlation ID even when the backend fails before echoing one.

## Diagnostic sink

The default `CLIENT_DIAGNOSTIC_SINK` writes the already-sanitized event to the browser console.

The sink is an Angular injection token so a future approved observability integration can replace it without changing feature code or the diagnostic event policy.

A replacement sink must receive only `ClientDiagnosticEvent`; it must not receive the original Error object, HTTP request, HTTP response, authentication state, or business payload.

Sink failures are contained and cannot crash application execution.

## Build identity

Every Angular build runs:

```bash
npm run generate:build-info
```

The generated metadata contains:

```text
appName
version
angularVersion
commitSha
buildId
```

Source precedence includes explicit build arguments plus GitHub, Vercel, and common CI commit/build identifiers.

No secrets, API URLs, tenant data, or environment variables are copied wholesale.

The same build identity is embedded into:

- the Angular diagnostic event metadata
- `/build-info.json`

The generated TypeScript and JSON files are build artifacts. They are created before start/test/build workflows and are intentionally ignored by Git.

## Runtime build-info endpoint

The production Nginx image serves:

```text
GET /build-info.json
```

with:

```text
Cache-Control: no-store
```

and the normal production security headers.

This endpoint allows deployment/support teams to identify the frontend build currently serving traffic without opening source maps or inspecting bundled JavaScript.

The endpoint intentionally contains no private configuration.

## Docker/CI identity

CI passes:

```text
APP_COMMIT_SHA = GITHUB_SHA
APP_BUILD_ID    = GITHUB_RUN_ID
```

into the Docker build.

The live runtime verifier confirms that the built image exposes a valid application name, Angular version, commit SHA, and build ID.


## External observability

No remote telemetry endpoint is configured by this group.

Before connecting a vendor or backend ingestion service:

1. approve the destination and retention policy
2. replace only `CLIENT_DIAGNOSTIC_SINK`
3. keep the existing sanitized event contract
4. do not add user/session/business payloads
5. verify network/CSP policy for the approved endpoint
6. document sampling and operational ownership
