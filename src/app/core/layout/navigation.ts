import { ROUTE_PATHS } from '../config/route-paths';

export interface NavigationItem {
  readonly label: string;
  readonly route: string;
}

export interface NavigationSection {
  readonly label: string;
  readonly items: readonly NavigationItem[];
}

export const NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', route: `/${ROUTE_PATHS.dashboard}` }],
  },
  {
    label: 'Inventory',
    items: [
      { label: 'Products', route: `/${ROUTE_PATHS.products}` },
      { label: 'Inventory', route: `/${ROUTE_PATHS.inventory}` },
      { label: 'Stock Counts', route: `/${ROUTE_PATHS.stockCounts}` },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Purchasing', route: `/${ROUTE_PATHS.purchasing}` },
      { label: 'Receiving', route: `/${ROUTE_PATHS.receiving}` },
      { label: 'Suppliers', route: `/${ROUTE_PATHS.suppliers}` },
      { label: 'Sales', route: `/${ROUTE_PATHS.sales}` },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Master Data', route: `/${ROUTE_PATHS.masterData}` },
      { label: 'Reports', route: `/${ROUTE_PATHS.reports}` },
      { label: 'Administration', route: `/${ROUTE_PATHS.administration}` },
    ],
  },
];
