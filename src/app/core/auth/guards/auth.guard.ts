import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthSessionService } from '../auth-session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);

  return session.ensureAuthenticated().pipe(
    map((authenticated) =>
      authenticated
        ? true
        : router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: state.url },
          }),
    ),
  );
};
