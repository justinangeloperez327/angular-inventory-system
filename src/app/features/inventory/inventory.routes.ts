import { Routes } from '@angular/router';

import { FeaturePlaceholderPage } from '../../shared/pages/feature-placeholder/feature-placeholder';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    component: FeaturePlaceholderPage,
    data: {
      title: 'Inventory',
      description: 'Stock balances and inventory operations will be implemented from Group 10.',
    },
  },
];
