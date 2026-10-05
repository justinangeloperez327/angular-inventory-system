import { Routes } from '@angular/router';

import { FeaturePlaceholderPage } from '../../shared/pages/feature-placeholder/feature-placeholder';

export const STOCK_COUNTS_ROUTES: Routes = [
  {
    path: '',
    component: FeaturePlaceholderPage,
    data: {
      title: 'Stock Counts',
      description: 'Physical stock counting and variance workflows will be implemented in Group 16.',
    },
  },
];
