# Inventory Core

Group 10 implements read-only inventory balances.

## Principle

Product master data does not own quantity.

Inventory quantity is represented as a balance for a specific product and warehouse, and the backend remains authoritative for all calculated stock state.

The Angular application displays:

- quantity on hand
- quantity reserved
- quantity available
- reorder level
- stock status

It does not mutate those values directly.

## Balance model

Each balance identifies:

- product
- warehouse
- unit
- on-hand quantity
- reserved quantity
- available quantity
- reorder threshold
- status
- last update time

Status values are:

```text
in-stock
low-stock
out-of-stock
```

The backend determines the status. Angular does not independently recalculate stock status.

## API contract

The frontend currently expects:

```text
GET /api/inventory/balances
GET /api/inventory/form-options
GET /api/inventory/products/:productId
GET /api/inventory/warehouses/:warehouseId
```

The balance list supports:

```text
page
pageSize
search
sort
direction
productId
warehouseId
status
```

Search should cover at least SKU and product name. Product-specific filtering remains available to API consumers through `productId`.

## Filter options

`GET /api/inventory/form-options` returns active warehouse options:

```text
id
code
name
```

The inventory page deliberately does not download the entire product catalog into a select control. Product lookup is server-side through the search query so this screen remains usable with large catalogs.

## Product inventory view

`GET /api/inventory/products/:productId` returns:

- product header information
- aggregate inventory totals
- paginated warehouse balance rows

## Warehouse inventory view

`GET /api/inventory/warehouses/:warehouseId` returns:

- warehouse header information
- aggregate inventory totals
- paginated product balance rows

## Quantities

`quantityOnHand` is physical/postable stock currently recorded.

`quantityReserved` is stock committed to downstream demand.

`quantityAvailable` is the backend-authoritative amount available for new demand.

The frontend deliberately does not assume that `available = onHand - reserved` because future allocation, quarantine, hold, or business rules may affect availability.

## Authorization

All Group 10 inventory views require:

```text
inventory.view
```

No mutation actions are introduced in this group.

Future groups add:

- Group 11: stock movement history
- Group 12: adjustments
- Group 13: transfers
- Group 16: stock counts
