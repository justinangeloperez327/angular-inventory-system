import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { APP_ENVIRONMENT } from '../config/app-environment.token';
import { toHttpParams } from './http-query-params';

export type ApiHeaders = HttpHeaders | Record<string, string | string[]>;

export interface ApiRequestOptions {
  readonly params?: object | HttpParams;
  readonly headers?: ApiHeaders;
  readonly context?: HttpContext;
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly environment = inject(APP_ENVIRONMENT);

  get<T>(path: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.http.get<T>(this.url(path), this.options(options));
  }

  post<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<TResponse> {
    return this.http.post<TResponse>(this.url(path), body, this.options(options));
  }

  put<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<TResponse> {
    return this.http.put<TResponse>(this.url(path), body, this.options(options));
  }

  patch<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<TResponse> {
    return this.http.patch<TResponse>(this.url(path), body, this.options(options));
  }

  delete<T>(path: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.http.delete<T>(this.url(path), this.options(options));
  }

  private url(path: string): string {
    const baseUrl = this.environment.apiBaseUrl.replace(/\/$/, '');
    const resourcePath = path.replace(/^\//, '');

    return resourcePath ? `${baseUrl}/${resourcePath}` : baseUrl;
  }

  private options(options: ApiRequestOptions): {
    params?: HttpParams;
    headers?: ApiHeaders;
    context?: HttpContext;
  } {
    return {
      params:
        options.params instanceof HttpParams
          ? options.params
          : toHttpParams(options.params),
      headers: options.headers,
      context: options.context,
    };
  }
}
