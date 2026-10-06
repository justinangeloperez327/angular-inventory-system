# Design System

The inventory-system visual layer uses Tailwind CSS v4 while remaining Angular-native.

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

The project intentionally imports Tailwind's theme and utilities layers without Preflight.

The application owns a narrow explicit base reset for box sizing, typography, form-font inheritance, focus visibility, and reduced-motion behavior. This keeps native control and table behavior predictable while Tailwind utilities provide the visual system.

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

## Global token bridge

The global theme still exposes CSS custom properties such as:

```text
--color-bg
--color-surface
--color-text
--color-border
--radius-sm
--shadow-md
```

Tailwind semantic utilities map onto these variables through `@theme inline`. They are part of the global token implementation, not a compatibility allowance for feature-level stylesheets.

Application components should use Tailwind utilities and shared Angular primitives instead of creating component CSS/SCSS files.

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


## Group 6 — dialogs, alerts, toasts, and states

The shared feedback/state layer now uses the Tailwind design system:

- Dialog
- Confirmation Dialog
- Alert
- Toast
- Empty State
- Skeleton
- Access Denied
- Not Found

Their legacy SCSS files are removed.

### Dialogs

Dialogs remain compact and use:

- 512px maximum width
- restrained 6px radius
- semantic border/surface/shadow
- CDK focus trapping
- automatic initial focus capture
- Escape dismissal
- backdrop dismissal
- programmatic title/description association

Confirmation dialogs pass their message as the dialog description so the confirmation context is announced immediately by assistive technology.

### Alerts

Alerts use a neutral white surface with only a 3px semantic left border:

```text
info       primary
success    success
warning    warning
danger     danger
```

Large tinted alert backgrounds are intentionally avoided.

Danger alerts use assertive live-region behavior; other alert types use polite status announcements.

### Toasts

Toasts use the same severity treatment as alerts and retain manual dismissal.

Each toast owns its announcement semantics:

- danger → `role="alert"`, assertive
- other variants → `role="status"`, polite

The outlet itself is only a labeled notification region, preventing danger notifications from being downgraded by a parent polite live region.

### Empty/error states

Empty states are deliberately text-first and low decoration. They support an optional eyebrow such as HTTP status code plus projected actions.

The 403 and 404 pages now reuse the same Empty State primitive rather than maintaining separate page-specific visual systems.

### Skeleton

Skeletons use a simple muted-surface pulse rather than a decorative gradient shimmer. Global reduced-motion handling continues to neutralize the animation for users who request reduced motion.


## Group 7 — dashboard

The dashboard is now a Tailwind-based operational workspace rather than a card-heavy summary page.

### Summary strip

The visible summary contains:

- products
- warehouses
- low-stock count
- out-of-stock count
- pending purchase orders
- pending receipts
- inventory value

The API's total-SKU metric remains available but is not displayed because it duplicates the product-scale signal without improving the first-screen decision.

Metric tiles are approximately 80px high, use a restrained left-border emphasis, and avoid decorative icons or oversized numbers.

### Operational attention

The first detailed section is Stock Attention. It uses the shared table primitive and right-aligns on-hand/reorder quantities.

Color is reserved for the semantic low-stock/out-of-stock status.

### Purchasing workload

Purchase Orders and Receiving sit side-by-side on wide screens and stack on smaller screens.

Each row links directly to the corresponding workflow detail rather than forcing the user through a list page first.

### Recent movements

Recent movement activity uses a ledger-style table with:

- timestamp
- SKU
- product
- warehouse
- movement type
- signed quantity
- reference

Quantities are right-aligned and use tabular numerals. Outbound quantities use semantic danger text; inbound values remain foreground-neutral.

### No decorative charts

No chart is added merely to make the dashboard look analytical. Trend visualization should be introduced only when it supports an actual operational decision.


## Group 8 — products and master data

Product Master and Master Data are now fully migrated from feature SCSS to Tailwind utilities.

### Product Master

Product lists use the shared table/filter primitives. Prices and reorder thresholds are right-aligned with tabular numerals; identifiers use the mono typeface.

Product forms use simple separated sections instead of bordered card stacks.

Product details use two-column definition-list sections on larger screens and collapse to one column on smaller screens. Commercial numbers remain aligned for scanability.

### Master Data

Categories, Units, and Warehouses share the same maintenance model:

- compact filter bar
- compact table
- text-level Edit / Activate / Deactivate actions
- lifecycle confirmation where required
- narrow create/edit forms
- no feature-specific list/form stylesheet

The Master Data landing page is a small three-destination navigation surface rather than a decorative dashboard.


## Group 9 — inventory and stock movements

Inventory and Stock Movements are now fully migrated from feature SCSS to Tailwind utilities.

### Inventory

Inventory screens communicate current stock position.

The main balance table right-aligns on-hand, reserved, available, and reorder values. SKU and warehouse codes use monospace styling.

Product/warehouse drill-down pages use a compact five-value summary strip followed by a single operational balance table.

### Stock Movements

Stock Movements communicates historical causality rather than current state.

The movement list is a ledger with signed quantity delta and resulting balance as the primary numeric fields. Negative deltas receive semantic danger emphasis while other values remain neutral.

The movement detail view is intentionally read-only and audit-oriented. Inventory, audit metadata, source reference, and notes are separated by simple horizontal rules rather than independent cards.


## Group 10 — adjustments and transfers

Adjustments and Transfers are fully migrated from feature SCSS to Tailwind utilities, including their server-backed product lookup components.

### Adjustments

Adjustment pages use a controlled correction-document pattern.

The list uses signed presentation quantities for rapid scanning while preserving the domain contract of positive quantity + direction.

The draft form keeps product, warehouse, direction, quantity, reason, and notes in one restrained workspace. Posting remains a separate confirmed command.

The detail view separates correction facts from posting audit and resulting stock movement.

### Transfers

Transfer pages emphasize warehouse route and product lines.

The form uses a source/destination header followed by a horizontal line-entry workspace. Large line sets retain tabular structure through horizontal scrolling rather than collapsing each row into a card.

The posted detail emphasizes Source → Destination, then shows per-line quantity, balance-before/after values, and paired outbound/inbound movement links.

Neither workflow introduces edit/delete behavior after posting.


## Group 11 — purchasing and receiving

Purchasing and Receiving are fully migrated from feature SCSS to Tailwind utilities, including supplier/product/PO lookup components.

### Purchase Orders

Purchase Orders use a transaction-document hierarchy rather than generic CRUD cards.

The list aligns line counts and money. The draft form uses a bounded order header and a horizontally scrollable commercial line table with quantity, unit price, line total, and subtotal.

The detail page keeps status-driven workflow actions in the page header and makes ordered / received / remaining quantities directly comparable.

### Receiving

Receiving mirrors Purchase Order structure so operators can move between purchasing and physical receipt without relearning the page model.

The receipt form inherits supplier/warehouse context from the selected approved PO and makes the physical quantity workflow explicit:

```text
ordered → previously received → remaining → receive now
```

Posted receipt details expose resulting inventory balance transitions and immutable stock-movement links.


## Group 12 — stock counts

Stock Counts are fully migrated from feature SCSS to Tailwind utilities.

### Session workflow

The UI treats a stock count as a warehouse reconciliation session rather than CRUD:

```text
Draft → Counting → Submitted for review → Posted
```

Starting captures the backend snapshot. Submission locks physical counts. Approval/posting remains permission-gated and backend-authoritative.

### Count entry

Count lines stay server-paginated and tabular. Large warehouses are never converted into one browser-sized form.

Expected, counted, and variance quantities are right-aligned with tabular numerals. Count-entry controls occupy a fixed compact numeric column.

Unsaved page edits continue to block filtering/pagination so physical counts cannot be silently discarded.

### Variance review

Variance is visualized as a signed delta:

```text
positive    +N, success emphasis
zero        0, neutral
negative    −N, danger emphasis
```

The server remains authoritative for variance and posting. Posted counts are immutable and link to the resulting stock-count movements.


## Group 13 — suppliers and customers

Suppliers and Customers now share one Tailwind business-partner master pattern.

### Lists

Partner lists use:

- monospace partner codes
- prominent partner name
- contact, email, and phone
- compact active/inactive status
- shared filter bar
- shared data footer
- restrained row-level maintenance actions

### Forms

Both partner forms are bounded master-data forms divided into:

```text
Identity
Contact
Address
```

Sections use whitespace and horizontal rules rather than independent cards.

### Profiles

Profiles use definition-list sections for Contact, Address, and Record metadata.

Supplier Purchase History remains a separate permission-gated panel because purchasing is a separate transactional domain. Its failure cannot make Supplier identity unavailable.

Customer Sales activity remains a handoff into the Sales domain via `customerId` filtering rather than duplicating sales history inside Customer Management.

Deactivation preserves historical transaction references for both partner types.

## Group 14 — sales and returns

Sales and Returns are fully migrated from feature SCSS to Tailwind utilities, including customer and product lookup controls.

### Sales orders

Sales uses a transaction-document hierarchy rather than generic CRUD cards.

The list prioritizes order number, customer, warehouse, date, line count, subtotal, and lifecycle status. Numeric and monetary values are right-aligned; identifiers use monospace styling.

The draft editor separates order context from line entry and notes. Product lines keep a horizontally scrollable tabular structure on narrow screens so quantity and price relationships remain easy to compare.

### Lifecycle

The workflow remains:

```text
Draft → Confirmed → Dispatched → Completed
          └─ Cancelled

Dispatched / Completed → Return
```

Confirmation is the reservation boundary. Dispatch is the inventory issue boundary. Completion is operational closure. The UI does not blur these state transitions into ordinary edit actions.

### Detail

Sales-order detail combines order identity, workflow audit, line quantities, movement links, returns, and notes without nested card panels.

Ordered, reserved, dispatched, and returned quantities are aligned as one operational table so inventory state can be reviewed at a glance.

### Returns

Returns are separate inventory transactions and use the same line-oriented document pattern.

Returnable and return-now quantities remain side by side. Posted return movements stay visible from the original sales order, preserving the audit trail rather than rewriting sale movements.

## Group 15 — reports

Reports are fully migrated from feature SCSS to Tailwind utilities.

### Catalog

The Reports landing page is a compact domain-grouped index instead of a card dashboard.

Inventory, Purchasing, and Sales reports are separated into clear sections with low-noise navigation rows. The description remains visible so users can choose the correct report without opening several pages.

### Viewer

All report definitions share one viewer pattern:

```text
Report heading
Filter bar
Summary strip
Generated timestamp
Dense data table
Pagination
```

Summary metrics use a restrained bordered strip rather than independent cards.

Numeric and currency columns are right-aligned with tabular numerals. Operational identifiers use monospace treatment where applicable.

### Data authority

The visual migration does not move reporting calculations into Angular.

Valuation, historical balances, transaction totals, summary aggregates, pagination, filtering, and CSV generation remain backend-authoritative.

## Group 16 — administration

Administration is fully migrated from feature SCSS to Tailwind utilities.

### Information architecture

Administration is treated as a set of privileged operational tools, not a visual dashboard.

The landing page is a permission-aware index into:

```text
Users
Roles & Permissions
Application Settings
Audit Log
```

### Users

User lists use compact tabular presentation and the shared filter/data-footer patterns.

User forms separate identity from role membership. User detail pages use definition-list sections and restrained lifecycle actions.

### Roles

Roles remain backend-authoritative authorization bundles.

Role lists align numeric permission/user counts for scanning. Permission editing is grouped by backend-defined capability area, and exact permission keys remain visible.

### Settings

Application settings use separated form sections rather than nested cards.

Organization defaults and inventory policy are visually distinct, while backend enforcement remains the source of truth.

### Audit

Audit history is presented as a read-only ledger.

Timestamps, actors, areas, actions, entity references, and summaries remain dense and searchable. Audit events are never generated or rewritten by the frontend.

## Group 17 — authentication and migration completion

Authentication is migrated to Tailwind and the visual-system migration is complete across the application.

### Sign-in

The sign-in page is intentionally minimal:

```text
Product identity
Sign-in heading
Email
Password
Primary submit action
Access note
```

It uses the same semantic colors, spacing, radius, typography, focus behavior, and shared controls as the authenticated shell.

### Global reset decision

Tailwind Preflight remains disabled intentionally.

The application already owns a small explicit base reset for:

- box sizing
- body defaults
- typography
- form-font inheritance
- focus visibility
- reduced-motion handling

Keeping that controlled reset avoids introducing broad native-element changes after the migration is complete.

### Migration status

The following surfaces are now Tailwind-based:

- application shell and navigation
- shared controls and feedback components
- dashboard
- products and master data
- inventory and stock movements
- adjustments and transfers
- purchasing and receiving
- stock counts
- suppliers and customers
- sales and returns
- reports
- administration
- authentication

Feature-level legacy SCSS has been removed from the migrated application surfaces.

## Group 18 — design-system enforcement and regression guard

The visual migration is now enforced by repository tooling rather than documentation alone.

### Final legacy cleanup

The enforcement pass found and removed the last component stylesheets that were outside the feature migrations:

- application root host styling
- Badge
- Breadcrumb
- Drawer

Their layout and variant styling now use Tailwind utilities or component class maps, so the application no longer depends on component-level CSS/SCSS under `src/app`.

### Component scaffolding

Angular component generation is configured with:

```text
@schematics/angular:component.style = none
```

New components therefore start without a component stylesheet and are expected to compose the existing Tailwind tokens and shared UI primitives.

The obsolete SCSS inline-style build preference is removed.

### Design-system guard

`npm run check:design` validates the application source and fails when:

- a component-level `.css`, `.scss`, `.sass`, or `.less` file appears under `src/app`
- an application TypeScript file declares `styleUrl` or `styleUrls`
- Angular component scaffolding stops using `style: none`
- the build reintroduces an `inlineStyleLanguage` preference

This guard is intentionally narrow. The global `src/styles.css` file remains the design-token and shared layout surface.

### CI and release gate

The CI pipeline runs the design-system guard before unit tests and production build.

The local release gate is:

```text
npm run check:design
npm test
npm run build:production
```

and is available as:

```bash
npm run check
```

This prevents future feature work from silently reverting the application to mixed Tailwind/component-SCSS styling.

## Group 19 — accessibility and keyboard hardening

Accessibility requirements are now enforced at both the shared-component and CI levels.

### Modal interaction parity

The generic Drawer now matches the Dialog interaction contract:

- generated accessible title ID
- `aria-labelledby`
- `aria-modal="true"`
- CDK focus trapping
- automatic focus capture
- Escape dismissal
- labelled close control
- backdrop dismissal

This prevents feature teams from receiving weaker keyboard behavior when they choose a drawer instead of a dialog.

### Accessibility guard

`npm run check:accessibility` statically audits Angular templates for baseline regressions.

The guard rejects:

- positive `tabindex`
- buttons without explicit type
- focusable controls hidden from assistive technology
- images without `alt`
- literal dialogs without modal semantics
- literal dialogs without accessible labelling

Both external `.html` templates and inline Angular `template:` blocks are scanned.

### Release gate

The repository release gate is now:

```text
Design-system guard
Accessibility guard
Unit tests
Production build
```

CI runs the accessibility guard before the test/build/Docker stages.

The static guard is intentionally a baseline. It does not replace manual keyboard review, screen-reader testing, or future rendered-browser accessibility automation.

## Group 20 — rendered-browser regression coverage

The application now has a Playwright browser smoke layer in addition to unit tests and static repository guards.

### Critical-flow coverage

The Chromium suite exercises the assembled Angular application with mocked REST responses:

- anonymous protected-route redirect
- sign-in validation
- successful sign-in and dashboard rendering
- persisted-session restoration
- permission-denied routing
- responsive mobile navigation focus management
- Escape close + trigger focus restoration
- sign-out session clearing
- authenticated 404 rendering

The browser suite uses the real Angular router, guards, session storage, shared components, lazy-loaded routes, and responsive styles.

Only the HTTP boundary is mocked.

### CI position

Browser E2E runs after unit tests and the production build, and before the Docker build/smoke stage.

The repository therefore checks the UI at four different levels:

```text
Static design-system rules
Static accessibility rules
Angular unit tests
Rendered Chromium critical flows
```

Docker validation remains the final deployable-container check.

### Test philosophy

E2E coverage stays intentionally narrow.

Backend transaction correctness, inventory accounting, authorization enforcement, and data validation belong to the NestJS backend test suite. Angular browser tests verify that frontend orchestration presents and routes those contracts correctly.

