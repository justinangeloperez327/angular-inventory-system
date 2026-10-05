# Purchasing

Group 14 implements purchase-order creation, submission, and approval.

## Workflow

```text
Draft
  ↓ submit (purchase.create)
Submitted
  ↓ approve (purchase.approve)
Approved
  ↓ receiving handled by Group 15
Partially received
  ↓
Received
```

Only drafts are editable.

Receiving-related status changes are owned by the backend/Group 15 workflow, not by the purchasing form.

## API contract

The frontend expects:

```text
GET  /api/purchase-orders
GET  /api/purchase-orders/form-options
GET  /api/purchase-orders/supplier-options?search=...
GET  /api/purchase-orders/product-options?search=...
GET  /api/purchase-orders/:id
POST /api/purchase-orders
PUT  /api/purchase-orders/:id
POST /api/purchase-orders/:id/submit
POST /api/purchase-orders/:id/approve
```

## Lookup strategy

Supplier and product catalogs are searched server-side and limited to a small result set.

The form-options endpoint returns bounded configuration:

- active receiving warehouses
- currency code

This avoids loading entire supplier/product catalogs into form controls.

## Purchase order fields

Header:

- supplier
- receiving warehouse
- order date
- expected date
- notes

Lines:

- product
- positive quantity
- non-negative unit price
- backend-authoritative line total

The form displays a client subtotal for operator feedback. The backend must recalculate and return authoritative line totals/subtotal.

Duplicate products are prevented by the UI and must also be validated by the API.

## Submission

Submission is a separate command.

The backend should validate at least:

- PO is still draft
- user has purchase.create
- supplier is active
- warehouse is active
- at least one valid line exists
- order/expected dates are valid
- quantities are positive
- unit prices are non-negative
- product references are valid

After submission, commercial details are immutable through this frontend workflow.

## Approval

Approval requires:

```text
purchase.approve
```

The backend should reject approval unless the PO is submitted and the authenticated user is authorized.

Once approved, the PO becomes eligible for receiving.

## Receiving boundary

Approved and partially received purchase orders expose a direct receiving action:

```text
/receiving/new?purchaseOrderId=:id
```

Receipt history for the PO is available at:

```text
/receiving?purchaseOrderId=:id
```

Group 15 owns receipt creation, partial receiving, posting, and receipt-generated inventory movements.

## Permissions

Read:

```text
purchase.view
```

Create/edit/submit:

```text
purchase.create
```

Approve:

```text
purchase.approve
```

Receive:

```text
purchase.receive
```

The API is the security boundary.

## Totals

Currency is supplied by backend configuration.

Angular calculates temporary line totals/subtotal for immediate form feedback only. The persisted PO response contains authoritative:

- line total
- subtotal
- currency code
