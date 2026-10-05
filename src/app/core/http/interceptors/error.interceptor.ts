import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { normalizeApiError } from '../api-error-normalizer';

export const errorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => throwError(() => normalizeApiError(error))),
  );
