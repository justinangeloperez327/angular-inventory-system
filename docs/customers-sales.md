# Customers and Sales

Customer master data and sales-order workflows are separate domains connected by customer identity.

## Customer master

Customer data contains:

- code and name
- primary contact
- email and phone
- tax number
- address lines
- city/state/postal code
- ISO country code
- active status

Customer endpoints:

```text
GET   /api/v1/customers
GET   /api/v1/customers/:id
POST  /api/v1/customers
PUT   /api/v1/customers/:id
PATCH /api/v1/customers/:id/status
```

Customers use activation/deactivation rather than normal hard deletion. Inactive customers remain valid historical references but are not eligible for new sales transactions.

Permissions:

```text
customer.view
customer.manage
```

## Sales lifecycle

```text
Draft
  ↓ confirm & reserve
Confirmed
  ├─ cancel → reservation released
  ↓ dispatch
Dispatched
  ↓ complete
Completed
```

Drafts are editable. Confirmed, dispatched, completed, and cancelled orders are immutable through the order editor.

Sales endpoints:

```text
GET  /api/v1/sales-orders
GET  /api/v1/sales-orders/form-options
GET  /api/v1/sales-orders/customer-options?search=...
GET  /api/v1/sales-orders/customers/:customerId/option
GET  /api/v1/sales-orders/product-options?warehouseId=...&search=...
GET  /api/v1/sales-orders/:id
POST /api/v1/sales-orders
PUT  /api/v1/sales-orders/:id
POST /api/v1/sales-orders/:id/confirm
POST /api/v1/sales-orders/:id/cancel
POST /api/v1/sales-orders/:id/dispatch
POST /api/v1/sales-orders/:id/complete
POST /api/v1/sales-orders/:id/returns
```

## Reservation and cancellation

Confirmation validates current availability and reserves stock without reducing physical on-hand quantity:

```text
quantityReserved += ordered quantity
quantityAvailable -= ordered quantity
quantityOnHand unchanged
```

Cancelling a confirmed order releases that reservation and creates no physical stock movement.

Availability displayed by Angular during draft editing is advisory; the backend is authoritative at confirmation.

## Dispatch and completion

Dispatch is the physical stock issue. The backend atomically reduces on-hand stock, releases the reservation, creates immutable sale movements, and records audit identity/time.

Completion is operational closure and does not create another stock movement.

## Returns

Returns are separate transactions against dispatched/completed orders.

Returnable quantity is:

```text
quantityDispatched - quantityReturned
```

Accepted returns increase inventory in the fulfillment warehouse and create immutable `return-in` movements without rewriting the original sale movement.

## Pricing

Angular calculates draft totals for immediate feedback. Persisted unit prices, line totals, subtotal, and currency are returned authoritatively by the API.

## Sales permissions

```text
sales.view       read orders
sales.create     create/edit/confirm drafts
sales.dispatch   cancel confirmed reservations, dispatch, complete
sales.return     create returns
```

The backend remains the security and inventory-integrity boundary.

## Presentation

Customer and sales pages use compact table-first layouts. The customer profile links into filtered/new sales-order flows instead of implementing a second sales-history API. Sales forms separate order context, line entry, notes, workflow audit, movements, and returns without duplicating inventory state in Angular.
