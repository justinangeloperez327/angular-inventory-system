import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/guards/permission.guard';
import { PERMISSIONS } from '../../core/auth/permissions';

export const INVENTORY_TRANSFERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./inventory-transfer-list/inventory-transfer-list-page').then(
        (component) => component.InventoryTransferListPage,
      ),
    title: 'Transfers | Inventory System',
  },
  {
    path: 'new',
    canActivate: [permissionGuard(PERMISSIONS.inventoryTransfer)],
    loadComponent: () =>
      import('./inventory-transfer-form/inventory-transfer-form-page').then(
        (component) => component.InventoryTransferFormPage,
      ),
    title: 'New transfer | Inventory System',
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard(PERMISSIONS.inventoryTransfer)],
    loadComponent: () =>
      import('./inventory-transfer-form/inventory-transfer-form-page').then(
        (component) => component.InventoryTransferFormPage,
      ),
    title: 'Edit transfer | Inventory System',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./inventory-transfer-detail/inventory-transfer-detail-page').then(
        (component) => component.InventoryTransferDetailPage,
      ),
    title: 'Transfer | Inventory System',
  },
];
