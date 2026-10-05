import { Routes } from '@angular/router';

import { FeaturePlaceholderPage } from '../../shared/pages/feature-placeholder/feature-placeholder';

export const ADMINISTRATION_ROUTES: Routes = [
  {
    path: '',
    component: FeaturePlaceholderPage,
    data: {
      title: 'Administration',
      description: 'Users, roles, settings, and audit logs will be implemented in Group 19.',
    },
  },
];
