import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/guards/permission.guard';
import { PERMISSIONS } from '../../core/auth/permissions';

export const PURCHASING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./purchase-order-list/purchase-order-list-page').then(
        (component) => component.PurchaseOrderListPage,
      ),
    title: 'Purchase Orders | Inventory System',
  },
  {
    path: 'new',
    canActivate: [permissionGuard(PERMISSIONS.purchaseCreate)],
    loadComponent: () =>
      import('./purchase-order-form/purchase-order-form-page').then(
        (component) => component.PurchaseOrderFormPage,
      ),
    title: 'New purchase order | Inventory System',
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard(PERMISSIONS.purchaseCreate)],
    loadComponent: () =>
      import('./purchase-order-form/purchase-order-form-page').then(
        (component) => component.PurchaseOrderFormPage,
      ),
    title: 'Edit purchase order | Inventory System',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./purchase-order-detail/purchase-order-detail-page').then(
        (component) => component.PurchaseOrderDetailPage,
      ),
    title: 'Purchase Order | Inventory System',
  },
];
