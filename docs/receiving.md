# Receiving

Group 15 implements goods receipts against approved purchase orders.

## Principle

Receiving is the inventory-posting transaction for purchasing.

```text
Approved / partially received PO
        ↓
Create / edit receipt draft
        ↓
Record physical quantities received
        ↓
Post receipt
        ↓
Backend revalidates remaining PO quantities
        ↓
PO received quantities update
Inventory balances increase
Receipt stock movements are created
        ↓
PO becomes partially-received or received
```

Draft receipts do not change inventory.

## API contract

The frontend expects:

```text
GET  /api/goods-receipts
GET  /api/goods-receipts/form-options
GET  /api/goods-receipts/purchase-order-options?search=...
GET  /api/goods-receipts/purchase-orders/:purchaseOrderId/context
GET  /api/goods-receipts/:id
POST /api/goods-receipts
PUT  /api/goods-receipts/:id
POST /api/goods-receipts/:id/post
```

## Purchase order selection

Only purchase orders in these states are eligible:

```text
approved
partially-received
```

Purchase-order lookup is server-backed.

An eligible PO links directly to:

```text
/receiving/new?purchaseOrderId=:id
```

and its receipt history is available at:

```text
/receiving?purchaseOrderId=:id
```

Once a receipt draft exists, its purchase order is fixed. Changing a receipt to a different PO would weaken the audit relationship between the draft, supplier delivery, and eventual inventory posting.

## Warehouse rule

The receipt warehouse is inherited from the purchase order.

The receiving form does not allow changing the warehouse. This prevents a receipt from silently posting purchased stock into a destination different from the approved PO.

## Partial receiving

The context endpoint returns each PO line with:

- quantity ordered
- quantity already received
- quantity remaining

Operators enter the quantity physically received in the current delivery.

Zero/blank lines are omitted from the receipt request. At least one positive receipt quantity is required.

The UI rejects a value above the displayed remaining quantity. The backend must revalidate remaining quantities at posting time because another receipt may have posted after the draft was loaded.

When an existing draft is edited, Angular refreshes the current PO context and merges the saved draft quantities into the latest remaining values. This exposes stale drafts before posting, but the API posting transaction is still the final authority.

## Posting requirements

Posting must be one backend transaction.

It must validate:

- receipt is still draft
- user has `purchase.receive`
- PO is approved or partially received
- PO supplier/warehouse relationships are unchanged and valid
- at least one positive line exists
- each receipt line belongs to the PO
- each quantity does not exceed the current remaining PO quantity
- inventory posting succeeds for every line

For each received line the backend must:

1. increase inventory in the PO warehouse
2. create an immutable `receipt` stock movement
3. increment the PO line received quantity
4. recompute remaining quantity

After all lines:

- any remaining quantity → PO status `partially-received`
- no remaining quantity → PO status `received`

If any operation fails, the entire posting transaction rolls back.

## Movement linkage

Posted receipt lines may return:

- balance before
- balance after
- movement ID/number

Angular constructs:

```text
/stock-movements/:movementId
```

from the movement ID.

## Permissions

The entire receiving feature requires:

```text
purchase.receive
```

The backend remains authoritative.

## Immutability

Only draft receipts can be edited.

Posted receipts have no edit/delete path. Corrections must be represented by an explicit authorized inventory transaction rather than rewriting the receiving ledger.


## Group 11 design migration

Receiving now uses the same document language as Purchase Orders.

The draft form keeps the selected purchase order as the authoritative source of supplier and warehouse context. Existing drafts continue to lock their PO selection.

Receipt entry prioritizes four quantities:

```text
Ordered
Previously received
Remaining
Receive now
```

Line-entry tables retain their columns through horizontal scrolling on smaller screens.

Posted receipt details show ordered, prior received, this receipt, remaining after, inventory balance transition, and the resulting immutable receipt movement.

Posted receipts remain immutable.
