# Dashboard

Group 6 implements the operational inventory dashboard.

## API contract

The dashboard uses one aggregate endpoint:

```text
GET /api/dashboard
```

The response is a point-in-time snapshot containing:

- generation timestamp
- total products
- total SKUs
- total warehouses
- low-stock count
- out-of-stock count
- pending purchase-order count
- pending receipt count
- inventory value and currency
- stock-risk rows
- pending purchase orders
- pending receipts
- recent stock movements

A single aggregate endpoint is preferred over multiple initial HTTP calls so the screen represents one consistent snapshot and avoids request fan-out.

## State

`DashboardStore` is provided at the dashboard page level.

It owns:

- current snapshot
- loading state
- normalized error message
- initial load
- manual refresh

The store is intentionally feature-scoped rather than global.

## Authorization

`dashboard.view` controls access to the dashboard route.

Detailed operational panels additionally respect their owning feature permissions:

- stock risk and recent movements: `inventory.view`
- purchase-order panel: `purchase.view`
- receiving panel: `purchase.receive`

The REST API remains authoritative and must only return dashboard data the authenticated user is allowed to receive.

## UI principles

The dashboard is operational rather than decorative. It prioritizes:

- compact operational summary metrics
- inventory exceptions requiring attention
- pending purchasing/receiving work
- recent stock activity

The visible KPI strip intentionally omits the redundant total-SKU tile even though the API may continue to return it.

Pending purchase-order and receipt rows link directly to their workflow details when the user has permission to see the relevant panel.

Stock and movement quantities are right-aligned with tabular numerals. Outbound movement quantities use semantic danger text; ordinary inbound quantities remain neutral.

Charts remain intentionally absent until a real decision benefits from trend visualization.
