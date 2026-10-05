import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../../shared/models/pagination.model';
import { MasterDataQuery } from '../../models/master-data-query.model';
import {
  Category,
  CategoryStatusRequest,
  CategoryUpsertRequest,
} from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly api = inject(ApiClient);

  list(query: MasterDataQuery): Observable<PaginatedResponse<Category>> {
    return this.api.get<PaginatedResponse<Category>>('categories', { params: query });
  }

  get(id: string): Observable<Category> {
    return this.api.get<Category>(`categories/${encodeURIComponent(id)}`);
  }

  create(request: CategoryUpsertRequest): Observable<Category> {
    return this.api.post<Category, CategoryUpsertRequest>('categories', request);
  }

  update(id: string, request: CategoryUpsertRequest): Observable<Category> {
    return this.api.put<Category, CategoryUpsertRequest>(
      `categories/${encodeURIComponent(id)}`,
      request,
    );
  }

  setActive(id: string, active: boolean): Observable<Category> {
    const request: CategoryStatusRequest = { active };
    return this.api.patch<Category, CategoryStatusRequest>(
      `categories/${encodeURIComponent(id)}/status`,
      request,
    );
  }
}
