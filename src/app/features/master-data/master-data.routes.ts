import { Routes } from '@angular/router';

import { FeaturePlaceholderPage } from '../../shared/pages/feature-placeholder/feature-placeholder';

export const MASTER_DATA_ROUTES: Routes = [
  {
    path: '',
    component: FeaturePlaceholderPage,
    data: {
      title: 'Master Data',
      description: 'Categories, units, and warehouses will be implemented in Group 8.',
    },
  },
];
