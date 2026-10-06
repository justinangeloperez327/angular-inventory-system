import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/guards/permission.guard';
import { PERMISSIONS } from '../../core/auth/permissions';

export const ADMINISTRATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./administration-home/administration-home-page').then(
        (component) => component.AdministrationHomePage,
      ),
    title: 'Administration | Inventory System',
  },
  {
    path: 'users',
    canActivate: [permissionGuard(PERMISSIONS.userManage)],
    loadComponent: () =>
      import('./users/admin-user-list-page').then(
        (component) => component.AdminUserListPage,
      ),
    title: 'Users | Inventory System',
  },
  {
    path: 'users/new',
    canActivate: [permissionGuard(PERMISSIONS.userManage)],
    loadComponent: () =>
      import('./users/admin-user-form-page').then(
        (component) => component.AdminUserFormPage,
      ),
    title: 'New user | Inventory System',
  },
  {
    path: 'users/:id/edit',
    canActivate: [permissionGuard(PERMISSIONS.userManage)],
    loadComponent: () =>
      import('./users/admin-user-form-page').then(
        (component) => component.AdminUserFormPage,
      ),
    title: 'Edit user | Inventory System',
  },
  {
    path: 'users/:id',
    canActivate: [permissionGuard(PERMISSIONS.userManage)],
    loadComponent: () =>
      import('./users/admin-user-detail-page').then(
        (component) => component.AdminUserDetailPage,
      ),
    title: 'User | Inventory System',
  },
  {
    path: 'roles',
    canActivate: [permissionGuard(PERMISSIONS.roleManage)],
    loadComponent: () =>
      import('./roles/admin-role-list-page').then(
        (component) => component.AdminRoleListPage,
      ),
    title: 'Roles & Permissions | Inventory System',
  },
  {
    path: 'roles/new',
    canActivate: [permissionGuard(PERMISSIONS.roleManage)],
    loadComponent: () =>
      import('./roles/admin-role-form-page').then(
        (component) => component.AdminRoleFormPage,
      ),
    title: 'New role | Inventory System',
  },
  {
    path: 'roles/:id/edit',
    canActivate: [permissionGuard(PERMISSIONS.roleManage)],
    loadComponent: () =>
      import('./roles/admin-role-form-page').then(
        (component) => component.AdminRoleFormPage,
      ),
    title: 'Edit role | Inventory System',
  },
  {
    path: 'settings',
    canActivate: [permissionGuard(PERMISSIONS.settingsManage)],
    loadComponent: () =>
      import('./settings/admin-settings-page').then(
        (component) => component.AdminSettingsPage,
      ),
    title: 'Application Settings | Inventory System',
  },
  {
    path: 'audit-log',
    canActivate: [permissionGuard(PERMISSIONS.auditView)],
    loadComponent: () =>
      import('./audit-log/admin-audit-log-page').then(
        (component) => component.AdminAuditLogPage,
      ),
    title: 'Audit Log | Inventory System',
  },
];
