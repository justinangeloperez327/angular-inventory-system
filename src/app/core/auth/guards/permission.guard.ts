import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthorizationService } from '../authorization.service';
import { Permission, PermissionMode } from '../permissions';

export function permissionGuard(
  required: Permission | readonly Permission[],
  mode: PermissionMode = 'all',
): CanActivateFn {
  return (_route, state) => {
    const authorization = inject(AuthorizationService);
    const router = inject(Router);
    const permissions = typeof required === 'string' ? [required] : required;

    return authorization.can(permissions, mode)
      ? true
      : router.createUrlTree(['/access-denied'], {
          queryParams: { from: state.url },
        });
  };
}
