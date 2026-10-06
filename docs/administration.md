# Administration

Group 19 implements user administration, role/permission assignment, application settings, and the read-only audit log.

## Permission model

Administration is split by responsibility:

```text
user.manage       user accounts, role membership, activation/deactivation
role.manage       role definitions and permission assignment
settings.manage   application and inventory operating settings
audit.view        read-only audit trail
```

The top-level `/administration` route accepts any one of these permissions. Each child route has its own specific guard.

## User administration

Endpoints:

```text
GET   /api/administration/users
GET   /api/administration/users/form-options
GET   /api/administration/users/:id
POST  /api/administration/users
PUT   /api/administration/users/:id
PATCH /api/administration/users/:id/status
```

The user list remains usable if optional role-filter metadata is unavailable.

Users are not hard-deleted.

Deactivation removes future access while retaining historical references and audit history.

The browser does not generate, store, display, or transmit administrator-created passwords. Credential invitation, enrollment, reset, MFA, and password policy belong to the authentication backend or identity provider.

The backend must prevent unsafe account changes, including as applicable:

- deactivating the last privileged administrator
- removing the last role that grants required administrative access
- unauthorized self-escalation
- bypassing identity-provider restrictions
- reactivating an account that is blocked by authentication policy

## Roles and permissions

Endpoints:

```text
GET  /api/administration/roles
GET  /api/administration/roles/form-options
GET  /api/administration/roles/:id
POST /api/administration/roles
PUT  /api/administration/roles/:id
```

The form-options endpoint returns the backend permission catalog grouped for display.

Angular does not assume its local `PERMISSIONS` constant is the complete permission universe. This lets the backend add protected capabilities without requiring the role editor to hardcode every permission.

Built-in roles can be marked `builtIn`. Their names are read-only in the current UI. The backend remains authoritative over which built-in role attributes may change.

No role-delete workflow is provided in Group 19 because role removal can orphan users or invalidate historical references. A future delete/archive policy should be explicit and backend-validated.

## Application settings

Endpoints:

```text
GET /api/administration/settings
GET /api/administration/settings/options
PUT /api/administration/settings
```

Current settings:

- organization name
- timezone
- currency code
- default page size
- allow-negative-stock policy
- stock-count concurrency policy

Inventory policy settings are backend-enforced. Changing the browser value alone never changes transaction behavior.

The backend must reject settings changes that are incompatible with existing inventory/accounting state.

## Stock-count policy

Supported policy values:

```text
freeze
reconcile
```

`freeze` means affected inventory transactions are blocked while a count is active.

`reconcile` means the backend reconciles intervening movements against the count snapshot before variance posting.

This setting implements the concurrency contract established in Group 16.

## Audit log

Endpoints:

```text
GET /api/administration/audit-log
GET /api/administration/audit-log/options
```

The audit log is read-only and server-paginated. It remains usable if optional area-filter metadata is unavailable.

Filters:

```text
page
pageSize
search
sort
direction
area
dateFrom
dateTo
```

An audit entry can include:

- occurred time
- actor
- area
- action
- entity type / ID / label
- human-readable summary

Audit events must be written by the backend as part of or immediately adjacent to the authoritative operation. Angular-generated audit entries are not authoritative.

## Security boundary

Every administration endpoint must independently validate authorization.

Hiding an Administration card or route in Angular is UX only. It does not grant or revoke backend access.
