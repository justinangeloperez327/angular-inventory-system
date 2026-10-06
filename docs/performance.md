# Frontend Performance

Group 21 establishes production bundle ceilings and build-cleanliness rules for the Angular Inventory System.

## Current baseline

The Group 20 production build measured:

```text
Initial raw bundle          333.13 kB
Estimated initial transfer   90.82 kB
Largest JavaScript chunk    155.38 kB
Global styles                32.17 kB
```

These values are a baseline, not a target that must remain byte-for-byte stable. Feature work may increase or decrease bundles, but significant growth must be intentional.

## Angular budgets

Production builds enforce:

```text
Initial bundle
  warning: 360 kB
  error:   400 kB

Any JavaScript file
  warning: 170 kB
  error:   200 kB
```

The initial error ceiling gives the current application roughly 20% headroom while still preventing large dependency or eager-loading regressions.

The per-script ceiling protects against a single shared or feature chunk becoming disproportionately large.

Existing component-style budgets remain configured even though component-level stylesheets are prohibited by the design-system guard.

## Lazy loading

Feature routes remain lazy-loaded through Angular Router.

A feature should not be moved into the initial bundle merely to simplify imports. Shared code belongs in the initial graph only when it is genuinely required by the application shell or multiple early routes.

## Build diagnostics

Angular extended diagnostics use:

```text
defaultCategory = error
```

Compiler-detectable template issues therefore fail the production build instead of being accepted as accumulating warnings.

Do not suppress a diagnostic globally to make CI green. Fix the template/type contract unless a specific diagnostic has a documented false-positive case.

## Production configuration guard

Run:

```bash
npm run check:production
```

The guard verifies that:

- production source maps remain disabled
- output hashing remains enabled for all build artifacts
- Angular automatic CSP remains enabled
- initial bundle ceilings are not loosened beyond the agreed limits
- per-script bundle ceilings are not loosened beyond the agreed limits
- Angular extended diagnostics remain build-breaking

Actual generated bundle sizes are still enforced by Angular itself during `npm run build:production`.

## Performance policy

Before adding a large dependency:

1. confirm the capability is not already available through Angular, the CDK, or browser APIs
2. prefer lazy feature integration where possible
3. evaluate whether the dependency increases the initial bundle
4. avoid shipping visualization/editor libraries to users who never enter those workflows
5. keep operational screens table- and form-oriented rather than adding decorative runtime-heavy UI

Bundle limits should only be raised when a reviewed product requirement justifies the additional client cost.
