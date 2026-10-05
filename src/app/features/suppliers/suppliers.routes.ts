import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/guards/permission.guard';
import { PERMISSIONS } from '../../core/auth/permissions';

export const SUPPLIERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./supplier-list/supplier-list-page').then(
        (component) => component.SupplierListPage,
      ),
    title: 'Suppliers | Inventory System',
  },
  {
    path: 'new',
    canActivate: [permissionGuard(PERMISSIONS.supplierManage)],
    loadComponent: () =>
      import('./supplier-form/supplier-form-page').then(
        (component) => component.SupplierFormPage,
      ),
    title: 'Add supplier | Inventory System',
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard(PERMISSIONS.supplierManage)],
    loadComponent: () =>
      import('./supplier-form/supplier-form-page').then(
        (component) => component.SupplierFormPage,
      ),
    title: 'Edit supplier | Inventory System',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./supplier-detail/supplier-detail-page').then(
        (component) => component.SupplierDetailPage,
      ),
    title: 'Supplier | Inventory System',
  },
];
