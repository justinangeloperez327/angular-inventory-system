import { InjectionToken } from '@angular/core';

import { ClientDiagnosticEvent } from './client-diagnostic.model';

export type ClientDiagnosticSink = (event: ClientDiagnosticEvent) => void;

export const CLIENT_DIAGNOSTIC_SINK = new InjectionToken<ClientDiagnosticSink>(
  'CLIENT_DIAGNOSTIC_SINK',
  {
    providedIn: 'root',
    factory: () => (event) => {
      console.error('[inventory-client-diagnostic]', event);
    },
  },
);
