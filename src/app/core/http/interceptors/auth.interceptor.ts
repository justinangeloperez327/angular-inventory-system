import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { APP_ENVIRONMENT } from '../../config/app-environment.token';
import { isApiRequest } from '../api-request';
import { AUTH_TOKEN_READER } from '../auth-token.token';
import { SKIP_AUTH } from '../http-context.tokens';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const environment = inject(APP_ENVIRONMENT);

  if (
    !isApiRequest(request.url, environment) ||
    request.context.get(SKIP_AUTH) ||
    request.headers.has('Authorization')
  ) {
    return next(request);
  }

  const token = inject(AUTH_TOKEN_READER)();

  if (!token) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
