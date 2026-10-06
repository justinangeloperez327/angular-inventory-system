# Customers and Sales

Group 17 implements customer master data and sales-order inventory workflows.

## Customer master

Customer endpoints:

```text
GET   /api/customers
GET   /api/customers/:id
POST  /api/customers
PUT   /api/customers/:id
PATCH /api/customers/:id/status
```

Customer permissions:

```text
customer.view
customer.manage
```

Inactive customers remain visible in historical orders but cannot be selected for new sales orders.

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

Drafts are editable. Confirmed, dispatched, completed, and cancelled orders are immutable through the order form.

## API contract

```text
GET  /api/sales-orders
GET  /api/sales-orders/form-options
GET  /api/sales-orders/customer-options?search=...
GET  /api/sales-orders/customers/:customerId/option
GET  /api/sales-orders/product-options?warehouseId=...&search=...
GET  /api/sales-orders/:id
POST /api/sales-orders
PUT  /api/sales-orders/:id
POST /api/sales-orders/:id/confirm
POST /api/sales-orders/:id/cancel
POST /api/sales-orders/:id/dispatch
POST /api/sales-orders/:id/complete
POST /api/sales-orders/:id/returns
```

## Reservation

Confirmation does not reduce on-hand quantity.

It must atomically validate current availability and reserve stock:

```text
quantityReserved += ordered quantity
quantityAvailable -= ordered quantity
quantityOnHand unchanged
```

The backend must reject confirmation if the order cannot be fully reserved.

Availability displayed in the draft product lookup is advisory only.

## Cancellation

A confirmed order may be cancelled before dispatch.

Cancellation must atomically release its reservation:

```text
quantityReserved -= reserved order quantity
quantityAvailable += released reservation
quantityOnHand unchanged
```

Cancellation creates no stock movement because no physical inventory moved.

## Dispatch

Dispatch is the physical stock issue.

For each order line the backend must atomically:

1. decrease on-hand quantity
2. release the matching reservation
3. create an immutable `sale` stock movement
4. record dispatched quantity and audit actor/time

The frontend currently models full-order dispatch. If partial dispatch is required later, it should be introduced as a first-class dispatch transaction rather than silently mutating line quantities.

## Completion

Completion is operational closure only.

It does not create another stock movement because inventory already changed at dispatch.

## Returns

Returns are separate transactions against dispatched/completed orders.

Returnable quantity:

```text
quantityDispatched - quantityReturned
```

Each accepted return line must:

1. validate it does not exceed remaining returnable quantity
2. increase inventory in the original fulfillment warehouse
3. create an immutable `return-in` movement
4. update cumulative returned quantity
5. retain a return transaction/audit record

Returns do not rewrite the original `sale` movement.

## Pricing

Angular calculates draft line totals and subtotal for immediate feedback only.

The API returns authoritative persisted:

- unit price
- line total
- subtotal
- currency code

## Permissions

```text
sales.view       read orders
sales.create     create/edit/confirm drafts
sales.dispatch   cancel confirmed reservations, dispatch, and complete
sales.return     create returns
```

The API is the security boundary.

## Inventory integrity

Angular never directly writes balances or reservations.

All reservation, cancellation, dispatch, completion, and return transitions are backend commands with transactional validation.

## Group 14 design migration

Sales and Returns use one transaction-document visual model from draft through inventory movement.

### Sales order list

The list is compact and table-first:

- order number uses monospace treatment
- customer and warehouse identifiers remain secondary to their names
- line counts and monetary totals are right-aligned with tabular numerals
- workflow status is the only prominent state color
- edit remains available only for draft orders
- customer-context filtering is visible and explicitly clearable

### Draft editor

The draft form separates order context, product lines, and notes using whitespace and horizontal rules instead of card stacks.

Product lines remain horizontally tabular at narrow widths rather than converting into disconnected cards. Warehouse changes still clear incompatible draft lines.

Availability shown by product search is advisory. Confirmation remains the server-authoritative reservation boundary.

### Detail and workflow actions

The detail page presents:

```text
Order context
Workflow audit
Ordered / Reserved / Dispatched / Returned
Movement links
Returns
Notes
```

Confirm, cancel, dispatch, complete, and return actions remain permission- and status-gated. Cancellation is presented as a destructive state transition but still releases reservation without changing on-hand inventory.

### Returns

Returns remain separate immutable transactions against dispatched or completed orders.

The return editor shows returnable quantity beside the new quantity in one horizontal line-entry workspace. Posting still validates the current remaining returnable quantity on the backend before increasing inventory and creating `return-in` movements.

### Styling

Sales feature pages and lookup controls no longer depend on feature-level SCSS. Layout and visual behavior are expressed through the shared Tailwind design system and shared UI primitives.

