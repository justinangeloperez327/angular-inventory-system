import { Routes } from '@angular/router';

import { anonymousGuard } from '../../core/auth/guards/anonymous.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    canActivate: [anonymousGuard],
    loadComponent: () => import('./login/login-page').then((component) => component.LoginPage),
    title: 'Sign in | Inventory System',
  },
];
