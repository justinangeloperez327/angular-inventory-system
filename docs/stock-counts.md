# Stock Counts

Group 16 implements warehouse physical-count sessions and variance posting.

## Workflow

```text
Draft
  ↓ start
Counting
  ↓ all lines counted
Submitted for review
  ↓ approve & post
Posted
```

Creating a draft does not snapshot inventory.

Starting the count asks the backend to capture the expected quantity snapshot for the selected warehouse and creates the count-line set.

## Scale

Count lines are paginated and server-backed.

The frontend deliberately does not load every SKU in a warehouse into one giant form. Operators count and save one page at a time.

Unsaved page edits block changing the page or line filters so entered physical counts are not silently discarded.

The lines endpoint supports:

```text
page
pageSize
search
sort
direction
varianceOnly
```

## API contract

```text
GET  /api/stock-counts
GET  /api/stock-counts/form-options
GET  /api/stock-counts/:id
GET  /api/stock-counts/:id/lines
POST /api/stock-counts
POST /api/stock-counts/:id/start
PUT  /api/stock-counts/:id/lines
POST /api/stock-counts/:id/submit
POST /api/stock-counts/:id/approve-and-post
```

## Counting

Each line contains:

- product
- expected quantity
- counted quantity
- variance quantity

Counted quantity can be zero but cannot be negative.

The backend calculates authoritative variance:

```text
variance = counted - expected
```

The UI displays returned variance but does not persist a client-calculated variance.

All count lines must be counted before submission.

Submitting locks counted quantities for review.

## Approval and posting

Approval is deliberately separate from counting.

Review/post permission:

```text
inventory.count.approve
```

The `approve-and-post` command must be one backend transaction. It validates the submitted session, current authorization, warehouse/count policy, and every variance before changing inventory.

For every non-zero approved variance the backend:

1. adjusts the warehouse balance
2. creates an immutable `stock-count` movement
3. records balance/variance audit data
4. links the movement to the count line

Zero-variance lines create no inventory movement.

After success the count becomes `posted` and is immutable.

## Concurrency policy

A physical count compares physical stock with an expected snapshot captured at count start.

Real systems must define what happens to inventory transactions occurring during the count. The backend must enforce one consistent policy, for example:

- freeze affected warehouse transactions during the count, or
- reconcile movements after the snapshot before computing postable variance

Angular must not guess or recompute this policy.

Posting must fail if the backend cannot safely reconcile the count against intervening inventory activity.

## Permissions

Count creation, counting, and submission:

```text
inventory.count
```

Approval and posting:

```text
inventory.count.approve
```

The API is the security boundary.

## Immutability

Posted counts cannot be edited.

Corrections after posting require another authorized inventory transaction so the stock ledger remains auditable.
