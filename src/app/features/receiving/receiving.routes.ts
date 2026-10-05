import { Routes } from '@angular/router';

export const RECEIVING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./goods-receipt-list/goods-receipt-list-page').then(
        (component) => component.GoodsReceiptListPage,
      ),
    title: 'Receiving | Inventory System',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./goods-receipt-form/goods-receipt-form-page').then(
        (component) => component.GoodsReceiptFormPage,
      ),
    title: 'New goods receipt | Inventory System',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./goods-receipt-form/goods-receipt-form-page').then(
        (component) => component.GoodsReceiptFormPage,
      ),
    title: 'Edit goods receipt | Inventory System',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./goods-receipt-detail/goods-receipt-detail-page').then(
        (component) => component.GoodsReceiptDetailPage,
      ),
    title: 'Goods Receipt | Inventory System',
  },
];
