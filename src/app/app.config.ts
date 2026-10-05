import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideAppEnvironment } from './core/config/app-environment.token';
import { authInterceptor } from './core/http/interceptors/auth.interceptor';
import { errorInterceptor } from './core/http/interceptors/error.interceptor';
import { loadingInterceptor } from './core/http/interceptors/loading.interceptor';
import { requestIdInterceptor } from './core/http/interceptors/request-id.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppEnvironment(),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        requestIdInterceptor,
        loadingInterceptor,
        errorInterceptor,
      ]),
    ),
    provideRouter(routes),
  ],
};
