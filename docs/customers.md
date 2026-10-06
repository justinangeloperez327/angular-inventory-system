# Customers

Customer Management provides customer master data used by Sales.

## Customer model

Customer master data contains:

- customer code
- customer name
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

Sales orders remain a separate transactional domain.

## API contract

The frontend expects:

```text
GET   /api/customers
GET   /api/customers/:id
POST  /api/customers
PUT   /api/customers/:id
PATCH /api/customers/:id/status
```

The list endpoint supports paging, searching, sorting, and active-status filtering.

## Lifecycle

Customers use activation/deactivation rather than normal hard deletion.

Inactive customers remain available for historical sales references but should not be eligible for new sales transactions.

## Permissions

```text
customer.view
customer.manage
sales.view
sales.create
```

The customer profile only exposes Sales handoff actions when the user has the corresponding Sales permission.

## Group 13 design migration

Customer Management uses the same business-partner visual language as Suppliers.

Lists are compact and table-first. Forms separate identity, contact, and address information without nested cards.

The customer profile does not invent a duplicate sales-history API. Instead, Sales remains the authoritative transactional domain:

```text
Customer profile
  → View sales orders (?customerId=...)
  → New sales order (?customerId=...)
```

Contact data remains independent from sales workflow availability.
