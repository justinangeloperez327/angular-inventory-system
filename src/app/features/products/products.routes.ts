import { Routes } from '@angular/router';

import { FeaturePlaceholderPage } from '../../shared/pages/feature-placeholder/feature-placeholder';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: FeaturePlaceholderPage,
    data: {
      title: 'Products',
      description: 'Product master data will be implemented in Group 7.',
    },
  },
];
