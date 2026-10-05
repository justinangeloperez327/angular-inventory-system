import { Routes } from '@angular/router';

import { FeaturePlaceholderPage } from '../../shared/pages/feature-placeholder/feature-placeholder';

export const RECEIVING_ROUTES: Routes = [
  {
    path: '',
    component: FeaturePlaceholderPage,
    data: {
      title: 'Receiving',
      description: 'Goods receiving and partial receipts will be implemented in Group 15.',
    },
  },
];
