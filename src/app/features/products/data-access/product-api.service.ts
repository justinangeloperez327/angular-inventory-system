import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  ProductDetail,
  ProductFormOptions,
  ProductStatusRequest,
  ProductSummary,
  ProductUpsertRequest,
} from '../models/product.model';
import { ProductQuery } from '../models/product-query.model';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly api = inject(ApiClient);

  list(query: ProductQuery): Observable<PaginatedResponse<ProductSummary>> {
    return this.api.get<PaginatedResponse<ProductSummary>>('products', { params: query });
  }

  get(id: string): Observable<ProductDetail> {
    return this.api.get<ProductDetail>(`products/${encodeURIComponent(id)}`);
  }

  getFormOptions(): Observable<ProductFormOptions> {
    return this.api.get<ProductFormOptions>('products/form-options');
  }

  create(request: ProductUpsertRequest): Observable<ProductDetail> {
    return this.api.post<ProductDetail, ProductUpsertRequest>('products', request);
  }

  update(id: string, request: ProductUpsertRequest): Observable<ProductDetail> {
    return this.api.put<ProductDetail, ProductUpsertRequest>(
      `products/${encodeURIComponent(id)}`,
      request,
    );
  }

  setActive(id: string, active: boolean): Observable<ProductDetail> {
    const request: ProductStatusRequest = { active };

    return this.api.patch<ProductDetail, ProductStatusRequest>(
      `products/${encodeURIComponent(id)}/status`,
      request,
    );
  }
}
