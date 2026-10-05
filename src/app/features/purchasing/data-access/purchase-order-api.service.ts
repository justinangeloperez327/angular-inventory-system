import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  PurchaseOrderDetail,
  PurchaseOrderFormOptions,
  PurchaseOrderProductOption,
  PurchaseOrderSummary,
  PurchaseOrderSupplierOption,
  PurchaseOrderUpsertRequest,
} from '../models/purchase-order.model';
import { PurchaseOrderQuery } from '../models/purchase-order-query.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderApiService {
  private readonly api = inject(ApiClient);

  list(query: PurchaseOrderQuery): Observable<PaginatedResponse<PurchaseOrderSummary>> {
    return this.api.get<PaginatedResponse<PurchaseOrderSummary>>('purchase-orders', {
      params: query,
    });
  }

  get(id: string): Observable<PurchaseOrderDetail> {
    return this.api.get<PurchaseOrderDetail>(
      `purchase-orders/${encodeURIComponent(id)}`,
    );
  }

  getFormOptions(): Observable<PurchaseOrderFormOptions> {
    return this.api.get<PurchaseOrderFormOptions>('purchase-orders/form-options');
  }

  searchSuppliers(search: string): Observable<readonly PurchaseOrderSupplierOption[]> {
    return this.api.get<readonly PurchaseOrderSupplierOption[]>(
      'purchase-orders/supplier-options',
      { params: { search, limit: 20 } },
    );
  }

  searchProducts(search: string): Observable<readonly PurchaseOrderProductOption[]> {
    return this.api.get<readonly PurchaseOrderProductOption[]>(
      'purchase-orders/product-options',
      { params: { search, limit: 20 } },
    );
  }

  create(request: PurchaseOrderUpsertRequest): Observable<PurchaseOrderDetail> {
    return this.api.post<PurchaseOrderDetail, PurchaseOrderUpsertRequest>(
      'purchase-orders',
      request,
    );
  }

  update(
    id: string,
    request: PurchaseOrderUpsertRequest,
  ): Observable<PurchaseOrderDetail> {
    return this.api.put<PurchaseOrderDetail, PurchaseOrderUpsertRequest>(
      `purchase-orders/${encodeURIComponent(id)}`,
      request,
    );
  }

  submit(id: string): Observable<PurchaseOrderDetail> {
    return this.api.post<PurchaseOrderDetail, Record<string, never>>(
      `purchase-orders/${encodeURIComponent(id)}/submit`,
      {},
    );
  }

  approve(id: string): Observable<PurchaseOrderDetail> {
    return this.api.post<PurchaseOrderDetail, Record<string, never>>(
      `purchase-orders/${encodeURIComponent(id)}/approve`,
      {},
    );
  }
}
