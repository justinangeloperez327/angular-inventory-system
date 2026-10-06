import { Routes } from '@angular/router';

import { REPORT_DEFINITIONS } from './report-definitions';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./report-hub/report-hub-page').then(
        (component) => component.ReportHubPage,
      ),
    title: 'Reports | Inventory System',
  },
  ...REPORT_DEFINITIONS.map((definition) => ({
    path: definition.id,
    loadComponent: () =>
      import('./report-viewer/report-viewer-page').then(
        (component) => component.ReportViewerPage,
      ),
    title: `${definition.title} | Inventory System`,
    data: { reportId: definition.id },
  })),
];
