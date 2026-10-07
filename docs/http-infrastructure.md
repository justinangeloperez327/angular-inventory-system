# HTTP Infrastructure

Group 3 establishes the application's REST transport layer.

## API client

Feature data-access services should depend on `ApiClient` instead of repeatedly composing the API base URL themselves.

```text
Feature data-access service
        ↓
ApiClient
        ↓
Angular HttpClient
        ↓
Interceptors
        ↓
REST API
```

The API base URL comes from `APP_ENVIRONMENT`.

## Interceptors

The configured functional interceptors are:

1. `authInterceptor`
   - reads a token through `AUTH_TOKEN_READER`
   - only attaches credentials to the configured application API
   - does nothing until Group 4 provides a real token reader
   - can be disabled per request with `SKIP_AUTH`

2. `requestIdInterceptor`
   - adds `X-Request-ID` to application API requests unless one already exists
   - does not add custom headers to unrelated third-party HTTP requests

3. `loadingInterceptor`
   - increments/decrements `HttpLoadingService`
   - can be disabled per request with `SKIP_GLOBAL_LOADING`

4. `errorInterceptor`
   - converts `HttpErrorResponse` into `ApiHttpError`
   - preserves normalized status, message, code, validation errors, and trace ID

## Error policy

Raw backend exceptions should not be displayed directly. Feature UI may use the normalized error message and validation errors while logging or support workflows can use the trace ID.

Network failures use status `0`.

## Query parameters

Use `toHttpParams` for ordinary request filters and `paginationToHttpParams` for the shared pagination contract. Null, undefined, and empty-string values are omitted.

## Authentication boundary

Group 3 deliberately does not store authentication credentials. `AUTH_TOKEN_READER` currently returns `null`. Group 4 will connect the interceptor to the authentication/session state without changing this transport layer.


## Backend compatibility contract

The Angular client targets the versioned NestJS base path:

```text
/api/v1
```

`npm run check:api-contract` verifies the frontend configuration and, in CI, compares every Angular `ApiClient` route/HTTP verb against the controllers in the pinned compatible backend revision.

The pinned backend revision is recorded in:

```text
contracts/backend-api-contract.json
```

Do not change the frontend API prefix or backend pin independently. Update them together after the compatibility guard passes against the intended NestJS revision.
