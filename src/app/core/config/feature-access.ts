import {
  Permission,
  PermissionMode,
  PERMISSIONS,
} from '../auth/permissions';

export interface FeatureAccess {
  readonly permissions: readonly Permission[];
  readonly permissionMode: PermissionMode;
}

export const FEATURE_ACCESS = {
  dashboard: {
    permissions: [PERMISSIONS.dashboardView],
    permissionMode: 'all',
  },
  products: {
    permissions: [PERMISSIONS.productView],
    permissionMode: 'all',
  },
  masterData: {
    permissions: [PERMISSIONS.masterDataView],
    permissionMode: 'all',
  },
  suppliers: {
    permissions: [PERMISSIONS.supplierView],
    permissionMode: 'all',
  },
  customers: {
    permissions: [PERMISSIONS.customerView],
    permissionMode: 'all',
  },
  inventory: {
    permissions: [PERMISSIONS.inventoryView],
    permissionMode: 'all',
  },
  stockMovements: {
    permissions: [PERMISSIONS.inventoryView],
    permissionMode: 'all',
  },
  adjustments: {
    permissions: [PERMISSIONS.inventoryView],
    permissionMode: 'all',
  },
  transfers: {
    permissions: [PERMISSIONS.inventoryView],
    permissionMode: 'all',
  },
  purchasing: {
    permissions: [PERMISSIONS.purchaseView],
    permissionMode: 'all',
  },
  receiving: {
    permissions: [PERMISSIONS.purchaseReceive],
    permissionMode: 'all',
  },
  stockCounts: {
    permissions: [PERMISSIONS.inventoryCount, PERMISSIONS.inventoryCountApprove],
    permissionMode: 'any',
  },
  sales: {
    permissions: [PERMISSIONS.salesView],
    permissionMode: 'all',
  },
  reports: {
    permissions: [PERMISSIONS.reportsView],
    permissionMode: 'all',
  },
  administration: {
    permissions: [
      PERMISSIONS.userManage,
      PERMISSIONS.roleManage,
      PERMISSIONS.settingsManage,
      PERMISSIONS.auditView,
    ],
    permissionMode: 'any',
  },
} as const satisfies Record<string, FeatureAccess>;
