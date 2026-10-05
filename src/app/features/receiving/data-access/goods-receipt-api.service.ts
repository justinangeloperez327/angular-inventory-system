import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  GoodsReceiptDetail,
  GoodsReceiptFormOptions,
  GoodsReceiptPurchaseOrderContext,
  GoodsReceiptPurchaseOrderOption,
  GoodsReceiptSummary,
  GoodsReceiptUpsertRequest,
} from '../models/goods-receipt.model';
import { GoodsReceiptQuery } from '../models/goods-receipt-query.model';

@Injectable({ providedIn: 'root' })
export class GoodsReceiptApiService {
  private readonly api = inject(ApiClient);

  list(query: GoodsReceiptQuery): Observable<PaginatedResponse<GoodsReceiptSummary>> {
    return this.api.get<PaginatedResponse<GoodsReceiptSummary>>('goods-receipts', {
      params: query,
    });
  }

  get(id: string): Observable<GoodsReceiptDetail> {
    return this.api.get<GoodsReceiptDetail>(
      `goods-receipts/${encodeURIComponent(id)}`,
    );
  }

  getFormOptions(): Observable<GoodsReceiptFormOptions> {
    return this.api.get<GoodsReceiptFormOptions>('goods-receipts/form-options');
  }

  searchPurchaseOrders(
    search: string,
  ): Observable<readonly GoodsReceiptPurchaseOrderOption[]> {
    return this.api.get<readonly GoodsReceiptPurchaseOrderOption[]>(
      'goods-receipts/purchase-order-options',
      { params: { search, limit: 20 } },
    );
  }

  getPurchaseOrderContext(
    purchaseOrderId: string,
  ): Observable<GoodsReceiptPurchaseOrderContext> {
    return this.api.get<GoodsReceiptPurchaseOrderContext>(
      `goods-receipts/purchase-orders/${encodeURIComponent(purchaseOrderId)}/context`,
    );
  }

  create(request: GoodsReceiptUpsertRequest): Observable<GoodsReceiptDetail> {
    return this.api.post<GoodsReceiptDetail, GoodsReceiptUpsertRequest>(
      'goods-receipts',
      request,
    );
  }

  update(
    id: string,
    request: GoodsReceiptUpsertRequest,
  ): Observable<GoodsReceiptDetail> {
    return this.api.put<GoodsReceiptDetail, GoodsReceiptUpsertRequest>(
      `goods-receipts/${encodeURIComponent(id)}`,
      request,
    );
  }

  post(id: string): Observable<GoodsReceiptDetail> {
    return this.api.post<GoodsReceiptDetail, Record<string, never>>(
      `goods-receipts/${encodeURIComponent(id)}/post`,
      {},
    );
  }
}
