# Product Master

Group 7 implements Product Master.

## Product model

A product contains master data only. Inventory quantities do not live on the product record.

Core fields:

- SKU
- barcode
- name
- description
- category
- unit of measure
- cost price
- selling price
- reorder level
- active status

Inventory balances remain warehouse-specific and are implemented in the inventory domain.

## API contract

The frontend currently expects:

```text
GET   /api/products
GET   /api/products/form-options
GET   /api/products/:id
POST  /api/products
PUT   /api/products/:id
PATCH /api/products/:id/status
```

The list endpoint uses server-side pagination and accepts:

```text
page
pageSize
search
sort
direction
categoryId
unitId
active
```

Search is intended to match at least SKU, barcode, and product name.

## Form options

`GET /api/products/form-options` returns categories, units, and the currency code required by Product Master.

This is a read-only dependency. Category and unit administration remains Group 8.

## Lifecycle

Products are activated/deactivated rather than hard-deleted from the normal UI.

Deactivation preserves historical purchase, receiving, stock, transfer, sales, and audit references. The backend remains responsible for validating whether a requested status transition is allowed.

## Permissions

- `product.view`: list and details
- `product.create`: create
- `product.update`: edit and reactivate
- `product.delete`: deactivate

These frontend controls are usability measures. The API must enforce the same permissions.

## Validation

Client-side validation covers required fields, non-negative prices/reorder levels, and practical maximum lengths.

Backend validation remains authoritative. Validation errors returned through the shared `ApiHttpError` contract are mapped back to matching product fields when possible.
