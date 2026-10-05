import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/guards/permission.guard';
import { PERMISSIONS } from '../../core/auth/permissions';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sales-order-list/sales-order-list-page').then(
        (component) => component.SalesOrderListPage,
      ),
    title: 'Sales Orders | Inventory System',
  },
  {
    path: 'new',
    canActivate: [permissionGuard(PERMISSIONS.salesCreate)],
    loadComponent: () =>
      import('./sales-order-form/sales-order-form-page').then(
        (component) => component.SalesOrderFormPage,
      ),
    title: 'New sales order | Inventory System',
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard(PERMISSIONS.salesCreate)],
    loadComponent: () =>
      import('./sales-order-form/sales-order-form-page').then(
        (component) => component.SalesOrderFormPage,
      ),
    title: 'Edit sales order | Inventory System',
  },
  {
    path: ':id/return',
    canActivate: [permissionGuard(PERMISSIONS.salesReturn)],
    loadComponent: () =>
      import('./sales-return/sales-return-page').then(
        (component) => component.SalesReturnPage,
      ),
    title: 'Sales Return | Inventory System',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./sales-order-detail/sales-order-detail-page').then(
        (component) => component.SalesOrderDetailPage,
      ),
    title: 'Sales Order | Inventory System',
  },
];
