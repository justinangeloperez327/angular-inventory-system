import { inject, Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';

import { AuthApiService } from './auth-api.service';
import { AuthStateService } from './auth-state.service';
import { LoginRequest } from './models/auth-contracts';
import { AuthUser } from './models/auth-user.model';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly api = inject(AuthApiService);
  private readonly state = inject(AuthStateService);

  readonly currentUser = this.state.currentUser;
  readonly hasSession = this.state.hasSession;
  readonly isAuthenticated = this.state.isAuthenticated;

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.api.login(credentials).pipe(
      tap((response) => this.state.establishSession(response.accessToken, response.user)),
      map((response) => response.user),
    );
  }

  ensureAuthenticated(): Observable<boolean> {
    if (!this.state.hasSession()) {
      return of(false);
    }

    if (this.state.currentUser()) {
      return of(true);
    }

    return this.api.currentUser().pipe(
      tap((user) => this.state.setCurrentUser(user)),
      map(() => true),
      catchError(() => {
        this.state.clear();
        return of(false);
      }),
    );
  }

  logout(): Observable<void> {
    if (!this.state.hasSession()) {
      this.state.clear();
      return of(undefined);
    }

    return this.api.logout().pipe(
      catchError(() => of(undefined)),
      finalize(() => this.state.clear()),
    );
  }

  clearSession(): void {
    this.state.clear();
  }
}
