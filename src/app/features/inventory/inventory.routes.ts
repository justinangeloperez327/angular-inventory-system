import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./inventory-balance/inventory-balance-page').then(
        (component) => component.InventoryBalancePage,
      ),
    title: 'Inventory | Inventory System',
  },
  {
    path: 'products/:productId',
    loadComponent: () =>
      import('./product-inventory/product-inventory-page').then(
        (component) => component.ProductInventoryPage,
      ),
    title: 'Product inventory | Inventory System',
  },
  {
    path: 'warehouses/:warehouseId',
    loadComponent: () =>
      import('./warehouse-inventory/warehouse-inventory-page').then(
        (component) => component.WarehouseInventoryPage,
      ),
    title: 'Warehouse inventory | Inventory System',
  },
];
