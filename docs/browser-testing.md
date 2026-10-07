# Browser Testing

Group 20 adds deterministic rendered-browser coverage with Playwright.

## Purpose

Unit tests and static guards verify isolated logic and repository contracts. Browser E2E verifies that the assembled Angular application still behaves correctly when routing, session storage, guards, responsive navigation, and lazy-loaded pages execute together.

The browser suite does not require a running NestJS backend.

Playwright intercepts the application's `/api/v1` requests and returns contract-shaped fixtures so failures remain attributable to the frontend.

## Covered critical flows

The initial Chromium smoke suite verifies:

1. Anonymous protected navigation redirects to Sign In and preserves a local return URL.
2. Sign In blocks invalid forms before an API request.
3. Successful authentication establishes the session and renders Dashboard.
4. A persisted session restores through `GET /api/v1/auth/me`.
5. Permission guards redirect unauthorized navigation to Access Denied.
6. Mobile navigation opens as a modal surface, captures focus, closes on Escape, and restores focus to the menu button.
7. Sign Out clears the local session and protected navigation becomes anonymous again.
8. Authenticated unknown routes render the 404 state inside the application shell.

The test data is intentionally small and deterministic. Browser smoke coverage should validate frontend orchestration, not recreate backend business-rule tests.

## Installation

Install dependencies and the Chromium browser:

```bash
npm install
npx playwright install chromium
```

Linux environments that need system browser dependencies can use:

```bash
npx playwright install --with-deps chromium
```

## Commands

Headless:

```bash
npm run e2e
```

Headed:

```bash
npm run e2e:headed
```

The Playwright development server starts Angular automatically on:

```text
http://127.0.0.1:4200
```

If a compatible local Angular server is already running, Playwright reuses it outside CI.

## REST mocking rule

Browser tests mock only the HTTP boundary.

They must not replace Angular route guards, services, state management, router navigation, session storage, or shared UI components. Those are the behaviors the suite is intended to exercise.

Fixtures should stay aligned with the documented NestJS-facing contracts.

## Artifacts

On failure, Playwright retains diagnostic artifacts such as:

- trace
- screenshot
- video

Generated browser artifacts are ignored by Git:

```text
playwright-report/
test-results/
blob-report/
```

## CI

CI installs Chromium and runs browser E2E after the production Angular build and before Docker verification.

The complete release gate is:

```text
Design-system guard
Accessibility guard
Unit tests
Production build
Browser E2E
Docker build / smoke test (CI)
```

Local `npm run check` includes every isolated frontend gate through Browser E2E. CI additionally runs the production-container full-stack integration suite after Docker verification. See `docs/full-stack-testing.md`.
