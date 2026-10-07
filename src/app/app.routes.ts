import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';
import { permissionGuard } from './core/auth/guards/permission.guard';
import { FEATURE_ACCESS, FeatureAccess } from './core/config/feature-access';
import { ROUTE_PATHS } from './core/config/route-paths';

function accessGuard(access: FeatureAccess) {
  return permissionGuard(access.permissions, access.permissionMode);
}

export const routes: Routes = [
  {
    path: ROUTE_PATHS.auth,
    loadChildren: () => import('./features/auth/auth.routes').then((routes) => routes.AUTH_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/app-shell/app-shell').then((component) => component.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: ROUTE_PATHS.dashboard },
      {
        path: ROUTE_PATHS.dashboard,
        canActivate: [accessGuard(FEATURE_ACCESS.dashboard)],
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((routes) => routes.DASHBOARD_ROUTES),
      },
      {
        path: ROUTE_PATHS.products,
        canActivate: [accessGuard(FEATURE_ACCESS.products)],
        loadChildren: () =>
          import('./features/products/products.routes').then((routes) => routes.PRODUCTS_ROUTES),
      },
      {
        path: ROUTE_PATHS.masterData,
        canActivate: [accessGuard(FEATURE_ACCESS.masterData)],
        loadChildren: () =>
          import('./features/master-data/master-data.routes').then((routes) => routes.MASTER_DATA_ROUTES),
      },
      {
        path: ROUTE_PATHS.suppliers,
        canActivate: [accessGuard(FEATURE_ACCESS.suppliers)],
        loadChildren: () =>
          import('./features/suppliers/suppliers.routes').then((routes) => routes.SUPPLIERS_ROUTES),
      },
      {
        path: ROUTE_PATHS.customers,
        canActivate: [accessGuard(FEATURE_ACCESS.customers)],
        loadChildren: () =>
          import('./features/customers/customers.routes').then((routes) => routes.CUSTOMERS_ROUTES),
      },
      {
        path: ROUTE_PATHS.inventory,
        canActivate: [accessGuard(FEATURE_ACCESS.inventory)],
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then((routes) => routes.INVENTORY_ROUTES),
      },
      {
        path: ROUTE_PATHS.stockMovements,
        canActivate: [accessGuard(FEATURE_ACCESS.stockMovements)],
        loadChildren: () =>
          import('./features/stock-movements/stock-movements.routes').then(
            (routes) => routes.STOCK_MOVEMENTS_ROUTES,
          ),
      },
      {
        path: ROUTE_PATHS.adjustments,
        canActivate: [accessGuard(FEATURE_ACCESS.adjustments)],
        loadChildren: () =>
          import('./features/inventory-adjustments/inventory-adjustments.routes').then(
            (routes) => routes.INVENTORY_ADJUSTMENTS_ROUTES,
          ),
      },
      {
        path: ROUTE_PATHS.transfers,
        canActivate: [accessGuard(FEATURE_ACCESS.transfers)],
        loadChildren: () =>
          import('./features/inventory-transfers/inventory-transfers.routes').then(
            (routes) => routes.INVENTORY_TRANSFERS_ROUTES,
          ),
      },
      {
        path: ROUTE_PATHS.purchasing,
        canActivate: [accessGuard(FEATURE_ACCESS.purchasing)],
        loadChildren: () =>
          import('./features/purchasing/purchasing.routes').then((routes) => routes.PURCHASING_ROUTES),
      },
      {
        path: ROUTE_PATHS.receiving,
        canActivate: [accessGuard(FEATURE_ACCESS.receiving)],
        loadChildren: () =>
          import('./features/receiving/receiving.routes').then((routes) => routes.RECEIVING_ROUTES),
      },
      {
        path: ROUTE_PATHS.stockCounts,
        canActivate: [accessGuard(FEATURE_ACCESS.stockCounts)],
        loadChildren: () =>
          import('./features/stock-counts/stock-counts.routes').then((routes) => routes.STOCK_COUNTS_ROUTES),
      },
      {
        path: ROUTE_PATHS.sales,
        canActivate: [accessGuard(FEATURE_ACCESS.sales)],
        loadChildren: () =>
          import('./features/sales/sales.routes').then((routes) => routes.SALES_ROUTES),
      },
      {
        path: ROUTE_PATHS.reports,
        canActivate: [accessGuard(FEATURE_ACCESS.reports)],
        loadChildren: () =>
          import('./features/reports/reports.routes').then((routes) => routes.REPORTS_ROUTES),
      },
      {
        path: ROUTE_PATHS.administration,
        canActivate: [accessGuard(FEATURE_ACCESS.administration)],
        loadChildren: () =>
          import('./features/administration/administration.routes').then(
            (routes) => routes.ADMINISTRATION_ROUTES,
          ),
      },
      {
        path: ROUTE_PATHS.accessDenied,
        loadComponent: () =>
          import('./shared/pages/access-denied/access-denied').then(
            (component) => component.AccessDeniedPage,
          ),
        title: 'Access denied | Inventory System',
      },
      {
        path: '**',
        loadComponent: () =>
          import('./shared/pages/not-found/not-found').then(
            (component) => component.NotFoundPage,
          ),
        title: 'Page not found | Inventory System',
      },
    ],
  },
];
