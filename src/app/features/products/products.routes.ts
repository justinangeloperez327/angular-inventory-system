import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/guards/permission.guard';
import { PERMISSIONS } from '../../core/auth/permissions';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./product-list/product-list-page').then((component) => component.ProductListPage),
    title: 'Products | Inventory System',
  },
  {
    path: 'new',
    canActivate: [permissionGuard(PERMISSIONS.productCreate)],
    loadComponent: () =>
      import('./product-form/product-form-page').then((component) => component.ProductFormPage),
    title: 'Add product | Inventory System',
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard(PERMISSIONS.productUpdate)],
    loadComponent: () =>
      import('./product-form/product-form-page').then((component) => component.ProductFormPage),
    title: 'Edit product | Inventory System',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./product-detail/product-detail-page').then((component) => component.ProductDetailPage),
    title: 'Product | Inventory System',
  },
];
