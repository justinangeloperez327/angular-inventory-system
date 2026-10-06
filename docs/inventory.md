# Inventory

Inventory screens present current stock state. They do not directly edit quantity.

## Principle

A product does not own inventory quantity.

Inventory is represented by a product/warehouse balance derived from posted business transactions.

The Angular inventory feature is read-only and expects the backend to provide authoritative:

- quantity on hand
- quantity reserved
- quantity available
- reorder level
- stock status
- last updated timestamp

## Views

The feature provides:

- all product/warehouse balances
- product inventory across warehouses
- warehouse inventory across products

Product and warehouse drill-down screens include summary totals and link to filtered Stock Movements.

## Group 9 design migration

Inventory is presented as a stock-position workspace:

- compact filters
- table-first layout
- monospace SKU/warehouse codes
- right-aligned quantity columns
- tabular numerals
- status color only for stock exceptions
- compact summary strip on drill-down pages

The summary strip shows on-hand, reserved, available, low-stock lines, and out-of-stock lines without decorative icons or charts.

Inventory remains read-only. Quantity corrections continue to happen through authorized receiving, adjustment, transfer, sales/return, or stock-count workflows.
