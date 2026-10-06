import { InjectionToken, Provider } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AppEnvironment } from '../../../environments/environment.model';

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT');

export function validateAppEnvironment(value: AppEnvironment): AppEnvironment {
  const apiBaseUrl = value.apiBaseUrl.trim();

  if (!apiBaseUrl) {
    throw new Error('Application configuration error: apiBaseUrl is required.');
  }

  if (!apiBaseUrl.startsWith('/')) {
    let parsed: URL;

    try {
      parsed = new URL(apiBaseUrl);
    } catch {
      throw new Error(
        'Application configuration error: apiBaseUrl must be a root-relative or absolute HTTP(S) URL.',
      );
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(
        'Application configuration error: apiBaseUrl must use HTTP or HTTPS.',
      );
    }

    if (value.production && parsed.protocol !== 'https:') {
      throw new Error(
        'Application configuration error: production apiBaseUrl must use HTTPS.',
      );
    }
  }

  return Object.freeze({
    ...value,
    apiBaseUrl,
  });
}

export function provideAppEnvironment(): Provider {
  return {
    provide: APP_ENVIRONMENT,
    useValue: validateAppEnvironment(environment),
  };
}
