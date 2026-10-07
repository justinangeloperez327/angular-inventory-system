import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { APP_ENVIRONMENT } from '../../config/app-environment.token';
import { ClientDiagnosticsService } from '../../observability/client-diagnostics.service';
import { normalizeApiError } from '../api-error-normalizer';
import { isApiRequest } from '../api-request';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const environment = inject(APP_ENVIRONMENT);
  const diagnostics = inject(ClientDiagnosticsService);
  const fallbackTraceId = request.headers.get('X-Request-ID') ?? undefined;

  return next(request).pipe(
    catchError((error: unknown) => {
      const normalized = normalizeApiError(error, fallbackTraceId);

      if (isApiRequest(request.url, environment)) {
        diagnostics.captureApiError(normalized);
      }

      return throwError(() => normalized);
    }),
  );
};
