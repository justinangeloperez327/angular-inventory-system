import { Permission, PermissionMode } from '../auth/permissions';
import { FEATURE_ACCESS } from '../config/feature-access';
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
        ...FEATURE_ACCESS.dashboard,
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
        ...FEATURE_ACCESS.products,
      },
      {
        label: 'Inventory',
        route: `/${ROUTE_PATHS.inventory}`,
        icon: 'inventory',
        ...FEATURE_ACCESS.inventory,
      },
      {
        label: 'Movements',
        route: `/${ROUTE_PATHS.stockMovements}`,
        icon: 'movements',
        ...FEATURE_ACCESS.stockMovements,
      },
      {
        label: 'Adjustments',
        route: `/${ROUTE_PATHS.adjustments}`,
        icon: 'adjustments',
        ...FEATURE_ACCESS.adjustments,
      },
      {
        label: 'Transfers',
        route: `/${ROUTE_PATHS.transfers}`,
        icon: 'transfers',
        ...FEATURE_ACCESS.transfers,
      },
      {
        label: 'Stock Counts',
        route: `/${ROUTE_PATHS.stockCounts}`,
        icon: 'counts',
        ...FEATURE_ACCESS.stockCounts,
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
        ...FEATURE_ACCESS.purchasing,
      },
      {
        label: 'Receiving',
        route: `/${ROUTE_PATHS.receiving}`,
        icon: 'receiving',
        ...FEATURE_ACCESS.receiving,
      },
      {
        label: 'Suppliers',
        route: `/${ROUTE_PATHS.suppliers}`,
        icon: 'suppliers',
        ...FEATURE_ACCESS.suppliers,
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
        ...FEATURE_ACCESS.sales,
      },
      {
        label: 'Customers',
        route: `/${ROUTE_PATHS.customers}`,
        icon: 'customers',
        ...FEATURE_ACCESS.customers,
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
        ...FEATURE_ACCESS.reports,
      },
      {
        label: 'Master Data',
        route: `/${ROUTE_PATHS.masterData}`,
        icon: 'master-data',
        ...FEATURE_ACCESS.masterData,
      },
      {
        label: 'Administration',
        route: `/${ROUTE_PATHS.administration}`,
        icon: 'administration',
        ...FEATURE_ACCESS.administration,
      },
    ],
  },
];
