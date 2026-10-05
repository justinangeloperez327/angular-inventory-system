import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  InventoryTransferDetail,
  InventoryTransferFormOptions,
  InventoryTransferProductOption,
  InventoryTransferSummary,
  InventoryTransferUpsertRequest,
} from '../models/inventory-transfer.model';
import { InventoryTransferQuery } from '../models/inventory-transfer-query.model';

@Injectable({ providedIn: 'root' })
export class InventoryTransferApiService {
  private readonly api = inject(ApiClient);

  list(query: InventoryTransferQuery): Observable<PaginatedResponse<InventoryTransferSummary>> {
    return this.api.get<PaginatedResponse<InventoryTransferSummary>>('inventory-transfers', {
      params: query,
    });
  }

  get(id: string): Observable<InventoryTransferDetail> {
    return this.api.get<InventoryTransferDetail>(
      `inventory-transfers/${encodeURIComponent(id)}`,
    );
  }

  getFormOptions(): Observable<InventoryTransferFormOptions> {
    return this.api.get<InventoryTransferFormOptions>('inventory-transfers/form-options');
  }

  searchProducts(
    sourceWarehouseId: string,
    search: string,
  ): Observable<readonly InventoryTransferProductOption[]> {
    return this.api.get<readonly InventoryTransferProductOption[]>(
      'inventory-transfers/product-options',
      { params: { sourceWarehouseId, search, limit: 20 } },
    );
  }

  create(request: InventoryTransferUpsertRequest): Observable<InventoryTransferDetail> {
    return this.api.post<InventoryTransferDetail, InventoryTransferUpsertRequest>(
      'inventory-transfers',
      request,
    );
  }

  update(
    id: string,
    request: InventoryTransferUpsertRequest,
  ): Observable<InventoryTransferDetail> {
    return this.api.put<InventoryTransferDetail, InventoryTransferUpsertRequest>(
      `inventory-transfers/${encodeURIComponent(id)}`,
      request,
    );
  }

  post(id: string): Observable<InventoryTransferDetail> {
    return this.api.post<InventoryTransferDetail, Record<string, never>>(
      `inventory-transfers/${encodeURIComponent(id)}/post`,
      {},
    );
  }
}
