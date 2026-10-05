import { computed, inject, Injectable } from '@angular/core';

import { AuthStateService } from './auth-state.service';
import { Permission, PermissionMode } from './permissions';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private readonly authState = inject(AuthStateService);

  readonly roles = computed(() => this.authState.currentUser()?.roles ?? []);
  readonly permissions = computed(() => this.authState.currentUser()?.permissions ?? []);

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasPermission(permission: Permission): boolean {
    return this.permissions().includes(permission);
  }

  hasAnyPermission(required: readonly Permission[]): boolean {
    return required.some((permission) => this.hasPermission(permission));
  }

  hasAllPermissions(required: readonly Permission[]): boolean {
    return required.every((permission) => this.hasPermission(permission));
  }

  can(required: readonly Permission[], mode: PermissionMode = 'all'): boolean {
    if (required.length === 0) {
      return true;
    }

    return mode === 'any'
      ? this.hasAnyPermission(required)
      : this.hasAllPermissions(required);
  }
}
