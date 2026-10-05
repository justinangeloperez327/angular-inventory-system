# Authorization

Group 5 adds permission-based authorization to the Angular application.

## Model

Roles are retained as user metadata, but application behavior is gated by permissions.

Examples:

```text
product.view
product.create
product.update
product.delete

inventory.view
inventory.adjust
inventory.transfer
inventory.count
inventory.count.approve

purchase.view
purchase.create
purchase.approve
purchase.receive

customer.view
customer.manage

sales.view
sales.create
sales.dispatch
sales.return

reports.view
user.manage
settings.manage
```

This prevents feature code from becoming coupled to backend role names such as "admin", "manager", or "warehouse-user".

## Current-user contract

The authenticated user may contain:

```json
{
  "id": "...",
  "email": "...",
  "name": "...",
  "roles": ["inventory-manager"],
  "permissions": [
    "dashboard.view",
    "product.view",
    "inventory.view",
    "inventory.adjust"
  ]
}
```

Missing permission data is treated as no permission (deny by default).

## Authorization service

`AuthorizationService` exposes:

- `hasRole`
- `hasPermission`
- `hasAnyPermission`
- `hasAllPermissions`
- `can`

Use permissions for application decisions. Role checks should be limited to cases where the role itself is meaningful UI metadata.

## Routes

Feature routes are protected with `permissionGuard`.

Unauthorized navigation is redirected to `/access-denied`.

Authentication and authorization remain separate:

```text
authGuard
   ↓
authenticated?
   ↓
permissionGuard
   ↓
authorized?
   ↓
feature
```

## Navigation

The sidebar filters navigation entries against the current user's permissions. Sections with no visible items are omitted.

Hiding navigation is a usability measure only; it is not a security boundary.

## Action visibility

Use the structural directive for permission-aware feature actions:

```html
<button *appHasPermission="'product.create'">
  Add product
</button>

<button *appHasPermission="[permissions.productUpdate, permissions.productDelete]; mode: 'any'">
  Manage product
</button>
```

The default mode requires all supplied permissions. Use `mode: 'any'` when any listed permission is sufficient.

## Security boundary

Angular authorization must never replace backend authorization.

The REST API must validate the authenticated user's permission for every protected operation, including reads, creates, updates, approvals, stock adjustments, transfers, receiving, sales reservations/dispatch/returns, and administrative changes.
