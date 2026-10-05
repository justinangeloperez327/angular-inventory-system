import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/guards/permission.guard';
import { PERMISSIONS } from '../../core/auth/permissions';

export const INVENTORY_ADJUSTMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./inventory-adjustment-list/inventory-adjustment-list-page').then(
        (component) => component.InventoryAdjustmentListPage,
      ),
    title: 'Adjustments | Inventory System',
  },
  {
    path: 'new',
    canActivate: [permissionGuard(PERMISSIONS.inventoryAdjust)],
    loadComponent: () =>
      import('./inventory-adjustment-form/inventory-adjustment-form-page').then(
        (component) => component.InventoryAdjustmentFormPage,
      ),
    title: 'New adjustment | Inventory System',
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard(PERMISSIONS.inventoryAdjust)],
    loadComponent: () =>
      import('./inventory-adjustment-form/inventory-adjustment-form-page').then(
        (component) => component.InventoryAdjustmentFormPage,
      ),
    title: 'Edit adjustment | Inventory System',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./inventory-adjustment-detail/inventory-adjustment-detail-page').then(
        (component) => component.InventoryAdjustmentDetailPage,
      ),
    title: 'Adjustment | Inventory System',
  },
];
