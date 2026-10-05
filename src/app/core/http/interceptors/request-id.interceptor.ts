import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { APP_ENVIRONMENT } from '../../config/app-environment.token';
import { isApiRequest } from '../api-request';

export const requestIdInterceptor: HttpInterceptorFn = (request, next) => {
  const environment = inject(APP_ENVIRONMENT);

  if (!isApiRequest(request.url, environment) || request.headers.has('X-Request-ID')) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        'X-Request-ID': createRequestId(),
      },
    }),
  );
};

function createRequestId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
