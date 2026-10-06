# Accessibility

The Angular Inventory System treats accessibility as part of the shared UI contract rather than a page-by-page enhancement.

## Baseline

The application targets predictable keyboard and assistive-technology behavior for operational workflows.

Shared requirements include:

- visible keyboard focus
- natural DOM focus order
- semantic native controls where possible
- explicit button types
- programmatic form labels
- field error/hint association
- labelled dialogs and drawers
- focus trapping for modal surfaces
- Escape dismissal for modal surfaces
- screen-reader-safe loading and notification states
- reduced-motion support
- non-color-only status communication

## Shared modal behavior

### Dialog

`app-dialog` provides:

- `role="dialog"`
- `aria-modal="true"`
- generated title/description IDs
- `aria-labelledby` / `aria-describedby`
- CDK focus trapping
- automatic focus capture
- Escape dismissal
- backdrop dismissal
- a labelled close control

### Drawer

`app-drawer` follows the same modal interaction contract:

- `role="dialog"`
- `aria-modal="true"`
- generated title ID
- `aria-labelledby`
- CDK focus trapping
- automatic focus capture
- Escape dismissal
- backdrop dismissal
- a labelled close control

Feature code should not recreate modal focus behavior independently.

## Form controls

Shared Input, Select, and Textarea components provide explicit label/control association and expose validation state through:

```text
aria-invalid
aria-describedby
```

Errors take precedence over hints when both would otherwise describe the same control.

Native browser semantics remain preferred over custom ARIA widgets.

## Navigation

The application shell provides:

- a keyboard-visible skip link
- semantic navigation landmarks
- `aria-current="page"` on active navigation
- focus-managed mobile navigation
- permission-aware links without changing backend authorization semantics

## Automated regression guard

Run:

```bash
npm run check:accessibility
```

The static template guard currently rejects:

- positive `tabindex`
- buttons without an explicit `type`
- focusable controls hidden with `aria-hidden="true"`
- images without `alt`
- literal dialog roles without `aria-modal`
- literal dialog roles without an accessible label

The guard scans external Angular templates plus inline `template:` blocks.

This is a baseline regression check, not a substitute for keyboard testing, screen-reader testing, or rendered-browser accessibility audits.

## Release gate

`npm run check` runs:

```text
design-system guard
accessibility guard
unit tests
production build
```

CI runs the same accessibility guard before tests and production build.

## Rendered-browser coverage

Group 20 adds Playwright coverage for the responsive mobile-navigation keyboard contract.

The browser test verifies that opening mobile navigation captures focus inside the modal navigation surface, Escape closes it, and focus returns to the menu trigger.

Static accessibility checks remain useful for broad template regressions; rendered-browser tests cover interaction behavior that static inspection cannot prove.

