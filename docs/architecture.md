# Application Architecture

The Angular Inventory System uses a feature-oriented architecture.

## Dependency direction

```text
Feature pages/components
        ↓
Feature data-access/store
        ↓
Core HTTP infrastructure
        ↓
REST API
```

## Top-level boundaries

- `core/`: application-wide infrastructure and configuration. It must not contain feature-specific business UI.
- `shared/`: reusable, business-agnostic UI, models, forms, directives, pipes, and utilities.
- `features/`: business capabilities. Features may depend on `core/` and `shared/`, but should not reach into another feature's internals.
- `environments/`: build-time environment configuration.

## Routing

Business areas are exposed through lazy route entry points. Feature implementation remains inside the corresponding feature folder.

## State

Use component state and Angular Signals by default. Feature-level stores may be introduced when a feature needs shared state. RxJS remains the primary abstraction for HTTP and asynchronous stream composition.

## API

The API base URL is provided through `APP_ENVIRONMENT`. Development and production currently use `/api`, allowing deployment infrastructure or a development proxy to decide the backend host without hard-coding ports in application code.

## Shared contracts

Generic API response, error, and pagination contracts live under `shared/models/`. Domain models belong inside their owning feature.
