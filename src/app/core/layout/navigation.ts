import { Permission, PermissionMode, PERMISSIONS } from '../auth/permissions';
import { ROUTE_PATHS } from '../config/route-paths';

export interface NavigationItem {
  readonly label: string;
  readonly route: string;
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
        permissions: [PERMISSIONS.productView],
      },
      {
        label: 'Inventory',
        route: `/${ROUTE_PATHS.inventory}`,
        permissions: [PERMISSIONS.inventoryView],
      },
      {
        label: 'Movements',
        route: `/${ROUTE_PATHS.stockMovements}`,
        permissions: [PERMISSIONS.inventoryView],
      },
      {
        label: 'Adjustments',
        route: `/${ROUTE_PATHS.adjustments}`,
        permissions: [PERMISSIONS.inventoryView],
      },
      {
        label: 'Transfers',
        route: `/${ROUTE_PATHS.transfers}`,
        permissions: [PERMISSIONS.inventoryView],
      },
      {
        label: 'Stock Counts',
        route: `/${ROUTE_PATHS.stockCounts}`,
        permissions: [PERMISSIONS.inventoryCount, PERMISSIONS.inventoryCountApprove],
        permissionMode: 'any',
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        label: 'Purchasing',
        route: `/${ROUTE_PATHS.purchasing}`,
        permissions: [PERMISSIONS.purchaseView],
      },
      {
        label: 'Receiving',
        route: `/${ROUTE_PATHS.receiving}`,
        permissions: [PERMISSIONS.purchaseReceive],
      },
      {
        label: 'Suppliers',
        route: `/${ROUTE_PATHS.suppliers}`,
        permissions: [PERMISSIONS.supplierView],
      },
      {
        label: 'Sales',
        route: `/${ROUTE_PATHS.sales}`,
        permissions: [PERMISSIONS.salesView],
      },
      {
        label: 'Customers',
        route: `/${ROUTE_PATHS.customers}`,
        permissions: [PERMISSIONS.customerView],
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        label: 'Master Data',
        route: `/${ROUTE_PATHS.masterData}`,
        permissions: [PERMISSIONS.masterDataView],
      },
      {
        label: 'Reports',
        route: `/${ROUTE_PATHS.reports}`,
        permissions: [PERMISSIONS.reportsView],
      },
      {
        label: 'Administration',
        route: `/${ROUTE_PATHS.administration}`,
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
