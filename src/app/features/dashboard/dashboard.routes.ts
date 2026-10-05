import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard-page').then((component) => component.DashboardPage),
    title: 'Dashboard | Inventory System',
  },
];
