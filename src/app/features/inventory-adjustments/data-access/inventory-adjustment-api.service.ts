import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  InventoryAdjustmentDetail,
  InventoryAdjustmentFormOptions,
  InventoryAdjustmentProductOption,
  InventoryAdjustmentSummary,
  InventoryAdjustmentUpsertRequest,
} from '../models/inventory-adjustment.model';
import { InventoryAdjustmentQuery } from '../models/inventory-adjustment-query.model';

@Injectable({ providedIn: 'root' })
export class InventoryAdjustmentApiService {
  private readonly api = inject(ApiClient);

  list(
    query: InventoryAdjustmentQuery,
  ): Observable<PaginatedResponse<InventoryAdjustmentSummary>> {
    return this.api.get<PaginatedResponse<InventoryAdjustmentSummary>>(
      'inventory-adjustments',
      { params: query },
    );
  }

  get(id: string): Observable<InventoryAdjustmentDetail> {
    return this.api.get<InventoryAdjustmentDetail>(
      `inventory-adjustments/${encodeURIComponent(id)}`,
    );
  }

  getFormOptions(): Observable<InventoryAdjustmentFormOptions> {
    return this.api.get<InventoryAdjustmentFormOptions>(
      'inventory-adjustments/form-options',
    );
  }

  searchProducts(search: string): Observable<readonly InventoryAdjustmentProductOption[]> {
    return this.api.get<readonly InventoryAdjustmentProductOption[]>(
      'inventory-adjustments/product-options',
      { params: { search, limit: 20 } },
    );
  }

  create(
    request: InventoryAdjustmentUpsertRequest,
  ): Observable<InventoryAdjustmentDetail> {
    return this.api.post<InventoryAdjustmentDetail, InventoryAdjustmentUpsertRequest>(
      'inventory-adjustments',
      request,
    );
  }

  update(
    id: string,
    request: InventoryAdjustmentUpsertRequest,
  ): Observable<InventoryAdjustmentDetail> {
    return this.api.put<InventoryAdjustmentDetail, InventoryAdjustmentUpsertRequest>(
      `inventory-adjustments/${encodeURIComponent(id)}`,
      request,
    );
  }

  post(id: string): Observable<InventoryAdjustmentDetail> {
    return this.api.post<InventoryAdjustmentDetail, Record<string, never>>(
      `inventory-adjustments/${encodeURIComponent(id)}/post`,
      {},
    );
  }
}
