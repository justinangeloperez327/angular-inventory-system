import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'inventory.access-token';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  private token = this.readStoredToken();

  readToken(): string | null {
    return this.token;
  }

  writeToken(token: string): void {
    this.token = token;

    try {
      globalThis.sessionStorage?.setItem(ACCESS_TOKEN_KEY, token);
    } catch {
      // Keep the token in memory when browser storage is unavailable.
    }
  }

  clearToken(): void {
    this.token = null;

    try {
      globalThis.sessionStorage?.removeItem(ACCESS_TOKEN_KEY);
    } catch {
      // The in-memory token has already been cleared.
    }
  }

  private readStoredToken(): string | null {
    try {
      return globalThis.sessionStorage?.getItem(ACCESS_TOKEN_KEY) ?? null;
    } catch {
      return null;
    }
  }
}
