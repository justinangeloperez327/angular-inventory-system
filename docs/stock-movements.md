# Stock Movements

Group 11 implements immutable stock movement history.

## Principle

Inventory balances represent current state.

Stock movements explain how that state changed.

The movement ledger is read-only in Angular. New movements are created only as consequences of authorized business operations such as receiving, sales dispatch, transfers, adjustments, returns, and approved stock counts.

## Movement types

```text
receipt
sale
transfer-in
transfer-out
adjustment-in
adjustment-out
return-in
return-out
stock-count
```

`quantityChange` is signed:

- positive values increase stock
- negative values decrease stock
- zero is permitted for an auditable event that does not change quantity

The backend supplies the signed quantity and optional resulting `balanceAfter`. Angular does not recalculate ledger values.

## API contract

The frontend expects:

```text
GET /api/stock-movements
GET /api/stock-movements/form-options
GET /api/stock-movements/:id
```

The list endpoint supports:

```text
page
pageSize
search
sort
direction
productId
warehouseId
type
dateFrom
dateTo
reference
```

Product filtering in the UI is server-side through SKU/product search rather than a full-catalog dropdown.

## Filters

The movement screen supports:

- product/SKU search
- warehouse
- movement type
- from date
- to date
- source reference

Product and warehouse inventory screens link into the ledger with pre-populated filters.

## Source references

A movement may contain:

```text
type
id
number
referencePath (optional)
```

The number and type are always displayable.

When the API supplies a safe local `referencePath`, Angular renders the source transaction as a link. The path must begin with exactly one `/`; protocol-relative and non-local paths are rejected.

Source modules may omit `referencePath` until their detail routes exist. This avoids generating broken links before Groups 12–17 implement those screens.

## Immutability

There are no create, edit, or delete controls in this feature.

Corrections must happen through a new authorized inventory transaction rather than rewriting historical movements.

## Authorization

Stock movement list and detail routes require:

```text
inventory.view
```

The backend remains authoritative and must scope movement records to the authenticated user's allowed inventory data.
