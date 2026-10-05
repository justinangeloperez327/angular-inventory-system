import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/guards/permission.guard';
import { PERMISSIONS } from '../../core/auth/permissions';

export const MASTER_DATA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./master-data-index-page').then((component) => component.MasterDataIndexPage),
    title: 'Master Data | Inventory System',
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories/category-list-page').then((component) => component.CategoryListPage),
    title: 'Categories | Inventory System',
  },
  {
    path: 'categories/new',
    canActivate: [permissionGuard(PERMISSIONS.masterDataManage)],
    loadComponent: () =>
      import('./categories/category-form-page').then((component) => component.CategoryFormPage),
    title: 'Add category | Inventory System',
  },
  {
    path: 'categories/:id/edit',
    canActivate: [permissionGuard(PERMISSIONS.masterDataManage)],
    loadComponent: () =>
      import('./categories/category-form-page').then((component) => component.CategoryFormPage),
    title: 'Edit category | Inventory System',
  },
  {
    path: 'units',
    loadComponent: () =>
      import('./units/unit-list-page').then((component) => component.UnitListPage),
    title: 'Units | Inventory System',
  },
  {
    path: 'units/new',
    canActivate: [permissionGuard(PERMISSIONS.masterDataManage)],
    loadComponent: () =>
      import('./units/unit-form-page').then((component) => component.UnitFormPage),
    title: 'Add unit | Inventory System',
  },
  {
    path: 'units/:id/edit',
    canActivate: [permissionGuard(PERMISSIONS.masterDataManage)],
    loadComponent: () =>
      import('./units/unit-form-page').then((component) => component.UnitFormPage),
    title: 'Edit unit | Inventory System',
  },
  {
    path: 'warehouses',
    loadComponent: () =>
      import('./warehouses/warehouse-list-page').then((component) => component.WarehouseListPage),
    title: 'Warehouses | Inventory System',
  },
  {
    path: 'warehouses/new',
    canActivate: [permissionGuard(PERMISSIONS.masterDataManage)],
    loadComponent: () =>
      import('./warehouses/warehouse-form-page').then((component) => component.WarehouseFormPage),
    title: 'Add warehouse | Inventory System',
  },
  {
    path: 'warehouses/:id/edit',
    canActivate: [permissionGuard(PERMISSIONS.masterDataManage)],
    loadComponent: () =>
      import('./warehouses/warehouse-form-page').then((component) => component.WarehouseFormPage),
    title: 'Edit warehouse | Inventory System',
  },
];
