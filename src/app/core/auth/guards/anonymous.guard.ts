import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { ROUTE_PATHS } from '../../config/route-paths';
import { AuthSessionService } from '../auth-session.service';

export const anonymousGuard: CanActivateFn = () => {
  const session = inject(AuthSessionService);
  const router = inject(Router);

  if (!session.hasSession()) {
    return true;
  }

  return session.ensureAuthenticated().pipe(
    map((authenticated) =>
      authenticated ? router.createUrlTree([`/${ROUTE_PATHS.dashboard}`]) : true,
    ),
  );
};
