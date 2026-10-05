import { computed, inject, Injectable, signal } from '@angular/core';

import { AuthStorageService } from './auth-storage.service';
import { AuthUser } from './models/auth-user.model';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly storage = inject(AuthStorageService);

  private readonly accessTokenState = signal<string | null>(this.storage.readToken());
  private readonly currentUserState = signal<AuthUser | null>(null);

  readonly currentUser = this.currentUserState.asReadonly();
  readonly hasSession = computed(() => this.accessTokenState() !== null);
  readonly isAuthenticated = computed(
    () => this.accessTokenState() !== null && this.currentUserState() !== null,
  );

  readAccessToken(): string | null {
    return this.accessTokenState();
  }

  establishSession(accessToken: string, user: AuthUser): void {
    this.storage.writeToken(accessToken);
    this.accessTokenState.set(accessToken);
    this.currentUserState.set(user);
  }

  setCurrentUser(user: AuthUser): void {
    this.currentUserState.set(user);
  }

  clear(): void {
    this.storage.clearToken();
    this.accessTokenState.set(null);
    this.currentUserState.set(null);
  }
}
