import { Routes } from '@angular/router';

import { FeaturePlaceholderPage } from '../../shared/pages/feature-placeholder/feature-placeholder';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    component: FeaturePlaceholderPage,
    data: {
      title: 'Reports',
      description: 'Inventory and purchasing reports will be implemented in Group 18.',
    },
  },
];
