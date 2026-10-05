import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';
import { permissionGuard } from './core/auth/guards/permission.guard';
import { PERMISSIONS } from './core/auth/permissions';
import { ROUTE_PATHS } from './core/config/route-paths';

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
      {
        path: '',
        pathMatch: 'full',
        redirectTo: ROUTE_PATHS.dashboard,
      },
      {
        path: ROUTE_PATHS.dashboard,
        canActivate: [permissionGuard(PERMISSIONS.dashboardView)],
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((routes) => routes.DASHBOARD_ROUTES),
      },
      {
        path: ROUTE_PATHS.products,
        canActivate: [permissionGuard(PERMISSIONS.productView)],
        loadChildren: () =>
          import('./features/products/products.routes').then((routes) => routes.PRODUCTS_ROUTES),
      },
      {
        path: ROUTE_PATHS.masterData,
        canActivate: [permissionGuard(PERMISSIONS.masterDataView)],
        loadChildren: () =>
          import('./features/master-data/master-data.routes').then((routes) => routes.MASTER_DATA_ROUTES),
      },
      {
        path: ROUTE_PATHS.suppliers,
        canActivate: [permissionGuard(PERMISSIONS.supplierView)],
        loadChildren: () =>
          import('./features/suppliers/suppliers.routes').then((routes) => routes.SUPPLIERS_ROUTES),
      },
      {
        path: ROUTE_PATHS.inventory,
        canActivate: [permissionGuard(PERMISSIONS.inventoryView)],
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then((routes) => routes.INVENTORY_ROUTES),
      },
      {
        path: ROUTE_PATHS.stockMovements,
        canActivate: [permissionGuard(PERMISSIONS.inventoryView)],
        loadChildren: () =>
          import('./features/stock-movements/stock-movements.routes').then(
            (routes) => routes.STOCK_MOVEMENTS_ROUTES,
          ),
      },
      {
        path: ROUTE_PATHS.purchasing,
        canActivate: [permissionGuard(PERMISSIONS.purchaseView)],
        loadChildren: () =>
          import('./features/purchasing/purchasing.routes').then((routes) => routes.PURCHASING_ROUTES),
      },
      {
        path: ROUTE_PATHS.receiving,
        canActivate: [permissionGuard(PERMISSIONS.purchaseReceive)],
        loadChildren: () =>
          import('./features/receiving/receiving.routes').then((routes) => routes.RECEIVING_ROUTES),
      },
      {
        path: ROUTE_PATHS.stockCounts,
        canActivate: [permissionGuard(PERMISSIONS.inventoryCount)],
        loadChildren: () =>
          import('./features/stock-counts/stock-counts.routes').then((routes) => routes.STOCK_COUNTS_ROUTES),
      },
      {
        path: ROUTE_PATHS.sales,
        canActivate: [permissionGuard(PERMISSIONS.salesView)],
        loadChildren: () =>
          import('./features/sales/sales.routes').then((routes) => routes.SALES_ROUTES),
      },
      {
        path: ROUTE_PATHS.reports,
        canActivate: [permissionGuard(PERMISSIONS.reportsView)],
        loadChildren: () =>
          import('./features/reports/reports.routes').then((routes) => routes.REPORTS_ROUTES),
      },
      {
        path: ROUTE_PATHS.administration,
        canActivate: [
          permissionGuard(
            [PERMISSIONS.userManage, PERMISSIONS.settingsManage],
            'any',
          ),
        ],
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
        redirectTo: ROUTE_PATHS.dashboard,
      },
    ],
  },
];
