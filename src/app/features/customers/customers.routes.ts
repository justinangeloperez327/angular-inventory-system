import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/guards/permission.guard';
import { PERMISSIONS } from '../../core/auth/permissions';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./customer-list/customer-list-page').then(
        (component) => component.CustomerListPage,
      ),
    title: 'Customers | Inventory System',
  },
  {
    path: 'new',
    canActivate: [permissionGuard(PERMISSIONS.customerManage)],
    loadComponent: () =>
      import('./customer-form/customer-form-page').then(
        (component) => component.CustomerFormPage,
      ),
    title: 'New customer | Inventory System',
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard(PERMISSIONS.customerManage)],
    loadComponent: () =>
      import('./customer-form/customer-form-page').then(
        (component) => component.CustomerFormPage,
      ),
    title: 'Edit customer | Inventory System',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./customer-detail/customer-detail-page').then(
        (component) => component.CustomerDetailPage,
      ),
    title: 'Customer | Inventory System',
  },
];
