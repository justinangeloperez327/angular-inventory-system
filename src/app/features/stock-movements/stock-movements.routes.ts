import { Routes } from '@angular/router';

export const STOCK_MOVEMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./stock-movement-list/stock-movement-list-page').then(
        (component) => component.StockMovementListPage,
      ),
    title: 'Stock Movements | Inventory System',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./stock-movement-detail/stock-movement-detail-page').then(
        (component) => component.StockMovementDetailPage,
      ),
    title: 'Stock Movement | Inventory System',
  },
];
