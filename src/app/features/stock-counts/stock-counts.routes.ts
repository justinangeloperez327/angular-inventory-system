import { Routes } from '@angular/router';

export const STOCK_COUNTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./stock-count-list/stock-count-list-page').then(
        (component) => component.StockCountListPage,
      ),
    title: 'Stock Counts | Inventory System',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./stock-count-create/stock-count-create-page').then(
        (component) => component.StockCountCreatePage,
      ),
    title: 'New stock count | Inventory System',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./stock-count-detail/stock-count-detail-page').then(
        (component) => component.StockCountDetailPage,
      ),
    title: 'Stock Count | Inventory System',
  },
];
