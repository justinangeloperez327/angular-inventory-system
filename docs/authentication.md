# Authentication

Group 4 introduces the client-side authentication boundary.

## Session model

The application uses a bearer access token supplied by the REST API.

The token is stored in `sessionStorage`, not `localStorage`. This means the session can survive a page refresh in the same browser session but is not intentionally persisted as a long-lived browser credential. If browser storage is unavailable, the token remains available in memory for the current runtime.

Only the access token is persisted. The current user remains in memory and is restored through `GET /auth/me`.

Authentication state is separated from API orchestration so interceptors can safely read or invalidate the session without creating an HTTP dependency cycle.

## API contract

The frontend currently expects:

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

The login response is expected to contain:

```json
{
  "accessToken": "...",
  "user": {
    "id": "...",
    "email": "...",
    "name": "..."
  },
  "expiresAt": "optional ISO timestamp"
}
```

## Routing

`/auth/login` is an anonymous route.

The application shell is protected by `authGuard`. When a protected URL is opened without a valid session, the user is redirected to login with a validated local `returnUrl`.

An already-authenticated user attempting to open the login page is redirected to the dashboard.

## Session validation

A persisted token is not treated as proof of a valid authenticated user. On a fresh application runtime, protected navigation calls `/auth/me`. A rejected or expired token is removed before redirecting to login.

During an active authenticated session, a protected API response with HTTP 401 clears the authentication state. If the application shell is already active, the user is redirected to login while preserving the current local URL as the return target.

## Logout

Logout calls the API when a token exists and clears the local session regardless of whether the server logout request succeeds.

## Security boundary

The frontend controls navigation and presentation only. The REST API must authenticate every protected request and must not rely on Angular route guards for security.

For deployments that use secure HTTP-only cookie authentication instead of bearer tokens, the storage/token provider can be replaced without changing feature-level data-access services.

## Authorization

Roles and permissions are intentionally not implemented here. They belong to Group 5.
