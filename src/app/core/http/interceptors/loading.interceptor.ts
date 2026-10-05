import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { SKIP_GLOBAL_LOADING } from '../http-context.tokens';
import { HttpLoadingService } from '../loading.service';

export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.context.get(SKIP_GLOBAL_LOADING)) {
    return next(request);
  }

  const loading = inject(HttpLoadingService);
  loading.begin();

  return next(request).pipe(finalize(() => loading.end()));
};
