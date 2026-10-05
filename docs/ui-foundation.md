# UI Foundation

Group 2 establishes the reusable presentation layer for the inventory application.

## Application shell

The authenticated application uses a responsive shell composed of:

- primary sidebar navigation
- top header
- routed content workspace
- global toast outlet

Authentication remains outside the application shell so login-related screens can use a separate layout later.

## Shared UI primitives

The reusable UI layer currently provides:

- Button
- Input
- Select
- Badge
- Alert
- Table
- Breadcrumb
- Pagination
- Empty state
- Skeleton
- Dialog
- Drawer
- Confirmation dialog
- Toast service/outlet
- Page header
- Content container

These components are deliberately business-agnostic. Product, warehouse, purchasing, and other domain rules belong in their feature folders.

## Design rules

- Prefer compact operational layouts over decorative dashboard UI.
- Keep spacing moderate and information density suitable for inventory work.
- Use semantic HTML and accessible labels.
- Use small radii and restrained visual hierarchy.
- Reuse global design tokens instead of feature-specific hard-coded styling where practical.
