import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import { SupplierPurchaseHistory } from '../models/supplier-purchase-history.model';
import {
  SupplierDetail,
  SupplierStatusRequest,
  SupplierSummary,
  SupplierUpsertRequest,
} from '../models/supplier.model';
import { SupplierQuery } from '../models/supplier-query.model';

@Injectable({ providedIn: 'root' })
export class SupplierApiService {
  private readonly api = inject(ApiClient);

  list(query: SupplierQuery): Observable<PaginatedResponse<SupplierSummary>> {
    return this.api.get<PaginatedResponse<SupplierSummary>>('suppliers', { params: query });
  }

  get(id: string): Observable<SupplierDetail> {
    return this.api.get<SupplierDetail>(`suppliers/${encodeURIComponent(id)}`);
  }

  create(request: SupplierUpsertRequest): Observable<SupplierDetail> {
    return this.api.post<SupplierDetail, SupplierUpsertRequest>('suppliers', request);
  }

  update(id: string, request: SupplierUpsertRequest): Observable<SupplierDetail> {
    return this.api.put<SupplierDetail, SupplierUpsertRequest>(
      `suppliers/${encodeURIComponent(id)}`,
      request,
    );
  }

  setActive(id: string, active: boolean): Observable<SupplierDetail> {
    const request: SupplierStatusRequest = { active };

    return this.api.patch<SupplierDetail, SupplierStatusRequest>(
      `suppliers/${encodeURIComponent(id)}/status`,
      request,
    );
  }

  purchaseHistory(id: string, page = 1, pageSize = 10): Observable<SupplierPurchaseHistory> {
    return this.api.get<SupplierPurchaseHistory>(
      `suppliers/${encodeURIComponent(id)}/purchase-history`,
      { params: { page, pageSize } },
    );
  }
}
