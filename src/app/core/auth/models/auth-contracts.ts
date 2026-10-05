import { AuthUser } from './auth-user.model';

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly user: AuthUser;
  readonly expiresAt?: string;
}
