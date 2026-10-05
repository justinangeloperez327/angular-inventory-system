import { HttpParams } from '@angular/common/http';

import { PaginationQuery } from '../../shared/models/pagination.model';

export type HttpQueryPrimitive = string | number | boolean;
export type HttpQueryValue =
  | HttpQueryPrimitive
  | readonly HttpQueryPrimitive[]
  | null
  | undefined;

export function toHttpParams(query?: object): HttpParams {
  let params = new HttpParams();

  if (!query) {
    return params;
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params = params.append(key, String(item));
      }
      continue;
    }

    params = params.set(key, String(value));
  }

  return params;
}

export function paginationToHttpParams(query: PaginationQuery): HttpParams {
  return toHttpParams(query);
}
