import { Routes } from '@angular/router';

import { FeaturePlaceholderPage } from '../../shared/pages/feature-placeholder/feature-placeholder';

export const SUPPLIERS_ROUTES: Routes = [
  {
    path: '',
    component: FeaturePlaceholderPage,
    data: {
      title: 'Suppliers',
      description: 'Supplier management will be implemented in Group 9.',
    },
  },
];
