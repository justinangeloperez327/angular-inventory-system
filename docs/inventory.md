# Inventory

Inventory screens present backend-authoritative stock state. Angular does not directly edit inventory quantity.

## Model

Inventory is a balance for a specific product and warehouse rather than a quantity owned by the product master record.

A balance exposes:

- product and warehouse identity
- unit
- quantity on hand
- quantity reserved
- quantity available
- reorder level
- stock status
- last updated timestamp

Status values are backend-defined:

```text
in-stock
low-stock
out-of-stock
```

Angular does not independently recalculate availability or stock status. Future allocation, quarantine, hold, or other rules may make those values more complex than simple arithmetic.

## API contract

The frontend expects:

```text
GET /api/v1/inventory/balances
GET /api/v1/inventory/form-options
GET /api/v1/inventory/products/:productId
GET /api/v1/inventory/warehouses/:warehouseId
```

The balance list supports paging, search, sorting, product/warehouse filtering, and stock-status filtering.

Form options return active warehouses. Product discovery remains server-side so the screen does not download the entire catalog into a select control.

## Views

The feature provides:

- all product/warehouse balances
- product inventory across warehouses
- warehouse inventory across products

Product and warehouse drill-down views include aggregate totals and links to filtered Stock Movements.

## Mutation boundary

Quantity changes happen through authoritative business transactions such as:

- receiving
- inventory adjustments
- inventory transfers
- sales dispatch/returns
- stock counts

Those workflows post backend transactions and movements; the read-only inventory views display the resulting state.

## Presentation

Inventory uses a compact table-first workspace with monospace business identifiers, right-aligned/tabular quantities, restrained status color, and summary totals on drill-down pages.

No direct inventory mutation controls belong on these pages.
