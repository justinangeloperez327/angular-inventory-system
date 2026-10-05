import { InjectionToken, Provider } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AppEnvironment } from '../../../environments/environment.model';

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT');

export function provideAppEnvironment(): Provider {
  return {
    provide: APP_ENVIRONMENT,
    useValue: environment,
  };
}
