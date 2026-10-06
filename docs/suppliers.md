# Suppliers

Group 9 implements Supplier Management.

## Supplier model

Supplier master data contains:

- supplier code
- supplier name
- primary contact
- email
- phone
- tax number
- address lines
- city
- state/province
- postal code
- ISO country code
- active status

Purchase orders and receipts remain separate transactional domains.

## API contract

The frontend currently expects:

```text
GET   /api/suppliers
GET   /api/suppliers/:id
POST  /api/suppliers
PUT   /api/suppliers/:id
PATCH /api/suppliers/:id/status

GET   /api/suppliers/:id/purchase-history
```

The list endpoint supports:

```text
page
pageSize
search
sort
direction
active
```

Search should cover at least supplier code, supplier name, contact name, email, and phone.

## Purchase history

Purchase history is read-only in the supplier profile and is requested only when the authenticated user has `purchase.view`.

It returns paginated purchase-order rows plus a currency code:

```text
page
pageSize
```

Purchase-history failure is isolated from the supplier profile. This is important because Supplier Management remains usable even before the full Group 14 purchasing implementation is available.

The actual purchase-order lifecycle is implemented in Group 14. Supplier Management only consumes the history contract.

## Lifecycle

Suppliers use activation/deactivation rather than normal hard deletion.

Deactivation preserves historical PO and receiving references. The backend should prevent creation of new purchasing transactions for inactive suppliers and may reject deactivation when an operational rule requires it.

## Permissions

- `supplier.view`: supplier list and profile
- `supplier.manage`: create, edit, activate, deactivate
- `purchase.view`: purchase-history panel and request

The parent application route already requires `supplier.view`. Create/edit routes and management actions additionally require `supplier.manage`.

## Validation

The Angular form validates required code/name, email shape, two-letter country code, and practical maximum lengths.

Backend validation remains authoritative for uniqueness, tax/business rules, referential integrity, and lifecycle constraints.


## Group 13 design migration

Supplier Management now uses the business-partner master design.

The list uses:

- monospace supplier codes
- direct mail/phone actions when present
- compact lifecycle status
- text-level Edit / Deactivate / Reactivate actions
- shared filter and pagination primitives

The form separates Supplier, Contact, and Address data using whitespace and rules instead of card panels.

The profile keeps supplier identity independent from purchasing. Purchase history remains permission-gated by `purchase.view`, is loaded separately, and failure remains isolated from the supplier profile. Purchase-order numbers now link directly into the Purchasing workflow.

The Clear filter action now clears status as well as search instead of silently retaining the default Active constraint.
