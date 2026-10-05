import { InjectionToken } from '@angular/core';

export type AuthTokenReader = () => string | null;

export const AUTH_TOKEN_READER = new InjectionToken<AuthTokenReader>('AUTH_TOKEN_READER', {
  factory: () => () => null,
});
