# Inventory Transfers

Group 13 implements controlled warehouse-to-warehouse inventory transfers.

## Principle

A transfer is one business transaction with two inventory effects per product line:

```text
Source warehouse
    ↓ transfer-out
Inventory transfer
    ↓ transfer-in
Destination warehouse
```

The transfer must post atomically. The system must never leave only one side of a transfer posted.

## Workflow

```text
Create / edit draft
        ↓
Review source, destination, and lines
        ↓
Post
        ↓
Backend revalidates available stock and permissions
        ↓
All source balances decrease
All destination balances increase
        ↓
Paired immutable movement records are created
        ↓
Transfer becomes posted and immutable
```

## API contract

The frontend expects:

```text
GET  /api/inventory-transfers
GET  /api/inventory-transfers/form-options
GET  /api/inventory-transfers/product-options?sourceWarehouseId=...&search=...
GET  /api/inventory-transfers/:id
POST /api/inventory-transfers
PUT  /api/inventory-transfers/:id
POST /api/inventory-transfers/:id/post
```

Create and update save drafts. The backend must reject modification of non-draft transfers.

## Transfer fields

Header:

- source warehouse
- destination warehouse
- notes

Lines:

- product
- positive quantity

A transfer requires at least one line.

Source and destination warehouses must be different.

Duplicate product lines are prevented in the UI and must also be rejected or normalized by the API.

There is deliberately no combined total quantity on a transfer because lines can use different units of measure.

## Product lookup

Product lookup is server-backed and scoped to the selected source warehouse.

The response includes current `quantityAvailable` for operator context. This is advisory only.

Posting must re-read and validate stock because availability can change between lookup and posting.

Changing the source warehouse clears current draft lines because those products and availability values were selected in the context of the previous source.

## Posting requirements

Posting must occur in one backend transaction and validate:

- transfer is still draft
- user has `inventory.transfer`
- source and destination are different and eligible
- at least one valid line exists
- all quantities are positive
- products are eligible in the source warehouse
- current source availability is sufficient
- duplicate lines are not accepted
- every source decrease and destination increase succeeds

For each line the backend creates:

```text
transfer-out movement at source
transfer-in movement at destination
```

The two movements should reference the same transfer.

If any line fails, the entire transfer posting operation must roll back.

## Audit

The posted detail may return:

- source balance before/after
- destination balance before/after
- outbound movement ID
- inbound movement ID
- creator/poster and timestamps

Angular constructs stock-movement links from movement IDs.

## Permissions

Read-only list/detail access:

```text
inventory.view
```

Create, edit, and post:

```text
inventory.transfer
```

The API remains the security boundary.

## Immutability

Posted transfers have no edit or delete path.

A correction must be represented by a separate authorized transaction so both warehouse ledgers remain auditable.


## Group 10 design migration

Transfer screens now use the transaction-document design system.

The list makes source and destination warehouses the primary routing context.

Create/edit presents:

- source and destination route
- source-scoped product lookup
- horizontally scrollable line-entry workspace
- advisory available quantity
- positive transfer quantity
- optional notes

The detail screen makes Source → Destination visually explicit, followed by a product table with quantity, source balance transition, destination balance transition, and paired movement links.

There is still no aggregate transfer quantity because mixed units make such a total semantically invalid.
