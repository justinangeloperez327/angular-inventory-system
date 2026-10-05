import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ApiHttpError } from '../../http/api-http-error';
import { SKIP_AUTH } from '../../http/http-context.tokens';
import { AuthStateService } from '../auth-state.service';

export const authFailureInterceptor: HttpInterceptorFn = (request, next) => {
  const state = inject(AuthStateService);
  const router = inject(Router);
  const wasAuthenticated = state.isAuthenticated();

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof ApiHttpError &&
        error.status === 401 &&
        !request.context.get(SKIP_AUTH)
      ) {
        state.clear();

        if (wasAuthenticated && !router.url.startsWith('/auth')) {
          void router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url },
            replaceUrl: true,
          });
        }
      }

      return throwError(() => error);
    }),
  );
};
