# Inventory Adjustments

Group 12 implements controlled inventory adjustments.

## Principle

An adjustment is a business transaction, not a direct edit to an inventory balance.

The workflow is:

```text
Create / edit draft
        ↓
Review
        ↓
Post
        ↓
Backend validates current stock and permissions
        ↓
Balance changes atomically
        ↓
Immutable adjustment-in or adjustment-out movement is created
```

Posted adjustments are immutable.

## API contract

The frontend expects:

```text
GET  /api/inventory-adjustments
GET  /api/inventory-adjustments/form-options
GET  /api/inventory-adjustments/product-options?search=...
GET  /api/inventory-adjustments/:id
POST /api/inventory-adjustments
PUT  /api/inventory-adjustments/:id
POST /api/inventory-adjustments/:id/post
```

Create and update save drafts. The backend must reject updates to non-draft adjustments.

Posting is a separate command and must be atomic.

## Product lookup

The create/edit form does not download the full product catalog.

Product selection uses a server-backed search and returns at most a small result set. This keeps the form viable for large inventories.

## Adjustment fields

- product
- warehouse
- direction: increase or decrease
- positive quantity
- controlled reason code
- notes

The user enters a positive quantity. Direction determines whether the backend creates an `adjustment-in` or `adjustment-out` movement.

## Reasons

`form-options` returns backend-controlled adjustment reasons.

A reason may be:

- valid for both directions
- restricted to increases
- restricted to decreases

The backend remains authoritative for allowed reasons.

## Posting

Posting must validate at least:

- the adjustment is still draft
- user has adjustment permission
- product and warehouse are active/eligible
- reason is valid for the direction
- quantity is positive
- decrease does not violate stock/business rules

When successful, the response includes the resulting movement ID/number plus optional balance-before/balance-after audit values. Angular constructs the known local stock-movement route from the movement ID rather than trusting a backend-supplied navigation path.

## Permissions

Read-only list/detail access requires:

```text
inventory.view
```

Create, edit, and post require:

```text
inventory.adjust
```

Frontend controls are not the security boundary. The API must enforce these rules.

## Immutability

There is no edit or delete path after posting.

A correction to a posted adjustment must be represented by another authorized adjustment so the stock ledger remains auditable.
