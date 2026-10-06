# Master Data

Group 8 implements Categories, Units of Measure, and Warehouses.

## Categories

Fields:

- code
- name
- description
- active

API:

```text
GET   /api/categories
GET   /api/categories/:id
POST  /api/categories
PUT   /api/categories/:id
PATCH /api/categories/:id/status
```

## Units of Measure

Fields:

- code
- name
- symbol
- active

API:

```text
GET   /api/units
GET   /api/units/:id
POST  /api/units
PUT   /api/units/:id
PATCH /api/units/:id/status
```

## Warehouses

Fields:

- code
- name
- location
- active

API:

```text
GET   /api/warehouses
GET   /api/warehouses/:id
POST  /api/warehouses
PUT   /api/warehouses/:id
PATCH /api/warehouses/:id/status
```

Warehouses are intentionally modeled separately from ordinary lookup data because they become inventory-balance and transaction boundaries in Groups 10–16.

## List behavior

All three list endpoints support server-side:

```text
page
pageSize
search
sort
direction
active
```

The default UI shows active records and supports switching to inactive or all records.

## Lifecycle

Master-data records use activation/deactivation instead of normal hard deletion.

Existing product and transaction references must remain valid. The backend remains responsible for rejecting unsafe deactivation, especially when a warehouse is still involved in active operational workflows.

## Permissions

- `master-data.view`: enter and read Master Data
- `master-data.manage`: create, edit, activate, deactivate

The parent application route already requires `master-data.view`. Create/edit routes and action controls additionally require `master-data.manage`.

## Validation

Client validation covers required values and practical maximum lengths.

Backend validation remains authoritative, including code uniqueness, reference integrity, lifecycle restrictions, and any domain-specific warehouse constraints.


## Group 8 design migration

Categories, Units of Measure, and Warehouses use one consistent maintenance pattern:

- shared compact filter bar
- shared operational table
- compact text row actions
- shared pagination footer
- activation/deactivation lifecycle
- restrained create/edit form with no nested cards

The Master Data index remains a small navigation surface for the three reference-data areas. Warehouses continue to be treated as operational inventory boundaries rather than generic lookups.
