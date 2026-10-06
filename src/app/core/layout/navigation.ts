import { Permission, PermissionMode, PERMISSIONS } from '../auth/permissions';
import { ROUTE_PATHS } from '../config/route-paths';

export type NavigationIcon =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'movements'
  | 'adjustments'
  | 'transfers'
  | 'counts'
  | 'purchasing'
  | 'receiving'
  | 'suppliers'
  | 'sales'
  | 'customers'
  | 'reports'
  | 'master-data'
  | 'administration';

export interface NavigationItem {
  readonly label: string;
  readonly route: string;
  readonly icon: NavigationIcon;
  readonly permissions?: readonly Permission[];
  readonly permissionMode?: PermissionMode;
}

export interface NavigationSection {
  readonly label: string;
  readonly items: readonly NavigationItem[];
}

export const NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        route: `/${ROUTE_PATHS.dashboard}`,
        icon: 'dashboard',
        permissions: [PERMISSIONS.dashboardView],
      },
    ],
  },
  {
    label: 'Inventory',
    items: [
      {
        label: 'Products',
        route: `/${ROUTE_PATHS.products}`,
        icon: 'products',
        permissions: [PERMISSIONS.productView],
      },
      {
        label: 'Inventory',
        route: `/${ROUTE_PATHS.inventory}`,
        icon: 'inventory',
        permissions: [PERMISSIONS.inventoryView],
      },
      {
        label: 'Movements',
        route: `/${ROUTE_PATHS.stockMovements}`,
        icon: 'movements',
        permissions: [PERMISSIONS.inventoryView],
      },
      {
        label: 'Adjustments',
        route: `/${ROUTE_PATHS.adjustments}`,
        icon: 'adjustments',
        permissions: [PERMISSIONS.inventoryView],
      },
      {
        label: 'Transfers',
        route: `/${ROUTE_PATHS.transfers}`,
        icon: 'transfers',
        permissions: [PERMISSIONS.inventoryView],
      },
      {
        label: 'Stock Counts',
        route: `/${ROUTE_PATHS.stockCounts}`,
        icon: 'counts',
        permissions: [PERMISSIONS.inventoryCount, PERMISSIONS.inventoryCountApprove],
        permissionMode: 'any',
      },
    ],
  },
  {
    label: 'Purchasing',
    items: [
      {
        label: 'Purchase Orders',
        route: `/${ROUTE_PATHS.purchasing}`,
        icon: 'purchasing',
        permissions: [PERMISSIONS.purchaseView],
      },
      {
        label: 'Receiving',
        route: `/${ROUTE_PATHS.receiving}`,
        icon: 'receiving',
        permissions: [PERMISSIONS.purchaseReceive],
      },
      {
        label: 'Suppliers',
        route: `/${ROUTE_PATHS.suppliers}`,
        icon: 'suppliers',
        permissions: [PERMISSIONS.supplierView],
      },
    ],
  },
  {
    label: 'Sales',
    items: [
      {
        label: 'Sales Orders',
        route: `/${ROUTE_PATHS.sales}`,
        icon: 'sales',
        permissions: [PERMISSIONS.salesView],
      },
      {
        label: 'Customers',
        route: `/${ROUTE_PATHS.customers}`,
        icon: 'customers',
        permissions: [PERMISSIONS.customerView],
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        label: 'Reports',
        route: `/${ROUTE_PATHS.reports}`,
        icon: 'reports',
        permissions: [PERMISSIONS.reportsView],
      },
      {
        label: 'Master Data',
        route: `/${ROUTE_PATHS.masterData}`,
        icon: 'master-data',
        permissions: [PERMISSIONS.masterDataView],
      },
      {
        label: 'Administration',
        route: `/${ROUTE_PATHS.administration}`,
        icon: 'administration',
        permissions: [
          PERMISSIONS.userManage,
          PERMISSIONS.roleManage,
          PERMISSIONS.settingsManage,
          PERMISSIONS.auditView,
        ],
        permissionMode: 'any',
      },
    ],
  },
];
