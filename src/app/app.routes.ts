import { Routes } from '@angular/router';

import { ROUTE_PATHS } from './core/config/route-paths';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.auth,
    loadChildren: () => import('./features/auth/auth.routes').then((routes) => routes.AUTH_ROUTES),
  },
  {
    path: '',
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
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((routes) => routes.DASHBOARD_ROUTES),
      },
      {
        path: ROUTE_PATHS.products,
        loadChildren: () =>
          import('./features/products/products.routes').then((routes) => routes.PRODUCTS_ROUTES),
      },
      {
        path: ROUTE_PATHS.masterData,
        loadChildren: () =>
          import('./features/master-data/master-data.routes').then((routes) => routes.MASTER_DATA_ROUTES),
      },
      {
        path: ROUTE_PATHS.suppliers,
        loadChildren: () =>
          import('./features/suppliers/suppliers.routes').then((routes) => routes.SUPPLIERS_ROUTES),
      },
      {
        path: ROUTE_PATHS.inventory,
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then((routes) => routes.INVENTORY_ROUTES),
      },
      {
        path: ROUTE_PATHS.purchasing,
        loadChildren: () =>
          import('./features/purchasing/purchasing.routes').then((routes) => routes.PURCHASING_ROUTES),
      },
      {
        path: ROUTE_PATHS.receiving,
        loadChildren: () =>
          import('./features/receiving/receiving.routes').then((routes) => routes.RECEIVING_ROUTES),
      },
      {
        path: ROUTE_PATHS.stockCounts,
        loadChildren: () =>
          import('./features/stock-counts/stock-counts.routes').then((routes) => routes.STOCK_COUNTS_ROUTES),
      },
      {
        path: ROUTE_PATHS.sales,
        loadChildren: () =>
          import('./features/sales/sales.routes').then((routes) => routes.SALES_ROUTES),
      },
      {
        path: ROUTE_PATHS.reports,
        loadChildren: () =>
          import('./features/reports/reports.routes').then((routes) => routes.REPORTS_ROUTES),
      },
      {
        path: ROUTE_PATHS.administration,
        loadChildren: () =>
          import('./features/administration/administration.routes').then(
            (routes) => routes.ADMINISTRATION_ROUTES,
          ),
      },
      {
        path: '**',
        redirectTo: ROUTE_PATHS.dashboard,
      },
    ],
  },
];
