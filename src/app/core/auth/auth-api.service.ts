import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../http/api-client.service';
import { SKIP_AUTH } from '../http/http-context.tokens';
import { AuthUser } from './models/auth-user.model';
import { LoginRequest, LoginResponse } from './models/auth-contracts';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiClient);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse, LoginRequest>('auth/login', credentials, {
      context: new HttpContext().set(SKIP_AUTH, true),
    });
  }

  currentUser(): Observable<AuthUser> {
    return this.api.get<AuthUser>('auth/me');
  }

  logout(): Observable<void> {
    return this.api.post<void, Record<string, never>>('auth/logout', {});
  }
}
