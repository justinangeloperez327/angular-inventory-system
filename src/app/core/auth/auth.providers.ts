import { Provider } from '@angular/core';

import { AUTH_TOKEN_READER } from '../http/auth-token.token';
import { AuthStateService } from './auth-state.service';

export const AUTH_PROVIDERS: readonly Provider[] = [
  {
    provide: AUTH_TOKEN_READER,
    useFactory: (state: AuthStateService) => () => state.readAccessToken(),
    deps: [AuthStateService],
  },
];
