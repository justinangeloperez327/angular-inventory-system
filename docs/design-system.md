# Design System

The inventory-system visual layer is migrating to Tailwind CSS v4 while remaining Angular-native.

## Stack

```text
Angular 22
Tailwind CSS v4
Angular CDK / Angular Aria
Custom Angular UI components
```

Tailwind provides the styling primitives and design-token API. Angular CDK/Aria provides behavior and accessibility primitives where native HTML is not sufficient. The application continues to own its component design rather than adopting a third-party visual component library.

## Group 1 foundation

Group 1 establishes:

- Tailwind v4 through the PostCSS integration supported by Angular
- a CSS-first semantic theme
- a deliberately restricted color, radius, typography, weight, and shadow vocabulary
- compatibility aliases for the existing SCSS component system
- global base typography/focus/reduced-motion behavior
- production/CI/Docker build compatibility

Feature pages are not visually migrated in Group 1.

## Tailwind integration

PostCSS configuration:

```text
@tailwindcss/postcss
```

Global stylesheet:

```text
src/styles.css
```

The project intentionally imports Tailwind's theme and utilities layers without Preflight during the incremental migration.

This prevents Tailwind's reset from unexpectedly changing the existing SCSS-based components before they are migrated.

After the shared components and feature pages have moved to the new design system, the final cleanup group may enable a unified reset if it is still useful.

## Semantic colors

Use semantic utilities rather than Tailwind's generic palette.

Preferred examples:

```text
bg-background
bg-surface
bg-surface-muted

text-foreground
text-muted-foreground
text-subtle-foreground

border-border
border-border-strong

bg-primary
text-primary
text-success
text-warning
text-danger
```

Do not introduce feature-specific arbitrary colors unless there is a genuine semantic requirement.

The current light palette is:

```text
background          #f7f8fa
surface             #ffffff
surface-muted       #f1f3f5
surface-strong      #e9edf1
foreground          #18212f
muted-foreground    #5e6877
subtle-foreground   #8a94a3
border              #dde1e6
border-strong       #c8cfd8
primary             #1f5f99
primary-hover       #194f80
success             #287a4b
warning             #a46912
danger              #b33a3a
focus               #315f8d
```

## Typography

The UI uses a restrained type scale:

```text
text-xs     12px
text-sm     13px
text-base   14px
text-lg     16px
text-xl     20px
text-2xl    24px
```

Supported design-system weights are:

```text
normal      400
medium      500
semibold    600
```

Avoid large display typography and excessive bold text. This is operational software, not a marketing site.

## Radius

The visual language is intentionally low-radius:

```text
rounded-xs   2px
rounded-sm   4px
rounded-md   6px
rounded-lg   8px
rounded-full badges/special cases only
```

## Spacing

Tailwind's 4px base spacing scale remains available for layout composition.

Named application dimensions include:

```text
control-sm   32px
control      40px
page         24px
sidebar      240px
```

Prefer the common layout rhythm:

```text
4 / 8 / 12 / 16 / 24px
```

before introducing unusual spacing values.

## Shadows

Shadows are intentionally limited:

```text
shadow-sm
shadow-md
shadow-lg
```

Most inventory UI should use borders and spacing rather than elevation.

## Compatibility during migration

Existing components still reference variables such as:

```text
--color-bg
--color-surface
--color-text
--color-border
--radius-sm
--shadow-md
```

Those remain defined during the migration, so adopting Tailwind does not require a single all-at-once visual rewrite.

Each subsequent group should migrate shared primitives and feature pages toward Tailwind utilities while removing obsolete component SCSS only after the replacement is verified.

## Rules

1. Prefer semantic color utilities.
2. Do not recreate Bootstrap/Material-style generic cards.
3. Use tables as the dominant data presentation pattern.
4. Keep controls compact.
5. Keep radius restrained.
6. Use status color only for meaningful state.
7. Preserve keyboard and screen-reader behavior.
8. Keep Angular templates readable; extract reusable UI patterns instead of repeating very long utility strings.
9. Do not use arbitrary values when an existing token communicates the same intent.
10. Production build, tests, and Docker validation must stay green throughout the migration.


## Group 2 — typography, spacing, and shell

The first visible migration establishes the global application frame.

Migrated to Tailwind utilities:

- application shell
- header
- sidebar
- shared content container
- shared page header

The obsolete SCSS files for these components are removed after migration.

### Global frame

```text
Header height    56px
Sidebar width    240px
Content maximum  1440px
Default control  40px
Small control    32px
```

The application uses a 14px default operational body size with restrained 12/13/14/16/20/24px hierarchy.

Bold text defaults to weight 600 rather than browser-default 700 to reduce visual noise.

### Page spacing

Shared content pages use:

```text
mobile      16px horizontal / 20px vertical
tablet      24px horizontal / 24px vertical
wide        32px horizontal / 24px vertical
```

Page content is centered and capped at 1440px. Data tables may still scroll horizontally when their content requires more width.

### Page header

The shared header now uses a 24px title and 14px description. Actions wrap without increasing the title hierarchy.

### Sidebar

The sidebar remains 240px wide and uses flat navigation rows rather than card-shaped links.

Active navigation uses:

- subtle muted surface
- foreground text
- medium weight
- a 2px primary left indicator

Responsive mobile drawer behavior and permission filtering are preserved.


## Group 3 — shared controls

The core interactive controls now use Tailwind utilities:

- Button
- Input
- Select
- Textarea

Their previous component SCSS files are removed.

### Control sizing

```text
small button       32px minimum height
default button     40px minimum height
input              40px minimum height
select             40px minimum height
textarea           96px minimum height
```

Inputs, selects, and textareas render as block-level, full-width controls so grids and filter bars determine their available width rather than the custom-element host shrinking to inline content.

### Button hierarchy

```text
primary      semantic primary blue
secondary    white surface + border
ghost        transparent
danger       semantic danger red
```

Primary actions use the design-system primary color. Neutral navigation/actions should use secondary or ghost buttons rather than overusing primary blue.

### Fields

Labels use 13px semibold text. Hint and validation copy use 12px text.

All field controls share:

- 4px radius
- semantic border color
- white surface
- 40px control height
- 14px entered text
- primary/focus border on keyboard or pointer focus
- semantic danger border and message for invalid state
- muted surface and reduced opacity when disabled

Native form semantics and ControlValueAccessor behavior are preserved.

### Accessibility

Fields preserve:

- explicit label/control association
- `aria-invalid`
- `aria-describedby` for error or hint text
- native disabled state
- visible global focus indication

Buttons preserve:

- native button type
- disabled state while loading
- `aria-busy`
- non-semantic loading spinner decoration


## Group 4 — tables and filters

The shared data-workspace primitives are now Tailwind-based.

### Table

`app-table` provides:

- horizontal overflow containment
- compact 36px header rows
- approximately 40px data rows
- subtle horizontal separators
- muted header surface
- tabular numerals
- low-noise row hover
- no vertical grid lines
- no automatic card conversion on narrow screens

Feature pages should explicitly use `text-right` for numeric and currency columns when those pages are migrated. Horizontal scrolling is preferred over destroying tabular structure on small screens.

### Filter bar

List/report forms use the shared layout classes:

```text
filter-bar
filter-bar__actions
```

The filter bar uses responsive auto-fit columns rather than feature-specific breakpoint grids. It remains compact and lets the shared Input/Select components determine control styling.

### Data footer

Paginated data views use:

```text
data-footer
```

for the result count + pagination row.

### Pagination

`app-pagination` uses compact 32px Previous/Next controls and tabular page numbering. Large numbered-page button sets are intentionally avoided because operational lists may have very large page counts.


## Group 5 — navigation and responsive shell

The navigation hierarchy is now organized around the user's operational mental model:

```text
Overview
  Dashboard

Inventory
  Products
  Inventory
  Movements
  Adjustments
  Transfers
  Stock Counts

Purchasing
  Purchase Orders
  Receiving
  Suppliers

Sales
  Sales Orders
  Customers

Management
  Reports
  Master Data
  Administration
```

Routes and permission requirements are unchanged; only their presentation hierarchy is improved.

### Navigation icons

Navigation uses an internal 16px line-icon component backed by inline SVG. No additional icon runtime/package is introduced.

Icons are decorative and hidden from assistive technology; link text remains the accessible name.

### Active state

Sidebar links use prefix-aware route matching so child/detail routes retain the correct active navigation item.

For example:

```text
/products
/products/new
/products/:id
/products/:id/edit
```

all keep Products active.

The active link also exposes `aria-current="page"`.

### Mobile drawer

Below the 1024px shell breakpoint:

- sidebar is off-canvas
- closed sidebar uses CSS visibility so its links are not keyboard reachable
- the menu button exposes `aria-controls` and `aria-expanded`
- opening moves focus to the drawer close button
- Escape closes the drawer
- closing returns focus to the menu button
- clicking the backdrop closes the drawer

Desktop navigation remains fixed and does not close/focus-jump when selecting a route.

### Header

The header remains 56px high and is sticky. The global application name is visually secondary so page-specific titles remain the dominant hierarchy.
