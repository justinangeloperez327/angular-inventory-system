import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  SalesOrderCustomerOption,
  SalesOrderDetail,
  SalesOrderFormOptions,
  SalesOrderProductOption,
  SalesOrderSummary,
  SalesOrderUpsertRequest,
  SalesReturnRequest,
  SalesReturnSummary,
} from '../models/sales-order.model';
import { SalesOrderQuery } from '../models/sales-order-query.model';

@Injectable({ providedIn: 'root' })
export class SalesOrderApiService {
  private readonly api = inject(ApiClient);

  list(query: SalesOrderQuery): Observable<PaginatedResponse<SalesOrderSummary>> {
    return this.api.get<PaginatedResponse<SalesOrderSummary>>('sales-orders', { params: query });
  }

  get(id: string): Observable<SalesOrderDetail> {
    return this.api.get<SalesOrderDetail>(`sales-orders/${encodeURIComponent(id)}`);
  }

  getFormOptions(): Observable<SalesOrderFormOptions> {
    return this.api.get<SalesOrderFormOptions>('sales-orders/form-options');
  }

  searchCustomers(search: string): Observable<readonly SalesOrderCustomerOption[]> {
    return this.api.get<readonly SalesOrderCustomerOption[]>(
      'sales-orders/customer-options',
      { params: { search, limit: 20 } },
    );
  }

  getCustomerOption(customerId: string): Observable<SalesOrderCustomerOption> {
    return this.api.get<SalesOrderCustomerOption>(
      `sales-orders/customers/${encodeURIComponent(customerId)}/option`,
    );
  }

  searchProducts(
    warehouseId: string,
    search: string,
  ): Observable<readonly SalesOrderProductOption[]> {
    return this.api.get<readonly SalesOrderProductOption[]>(
      'sales-orders/product-options',
      { params: { warehouseId, search, limit: 20 } },
    );
  }

  create(request: SalesOrderUpsertRequest): Observable<SalesOrderDetail> {
    return this.api.post<SalesOrderDetail, SalesOrderUpsertRequest>('sales-orders', request);
  }

  update(id: string, request: SalesOrderUpsertRequest): Observable<SalesOrderDetail> {
    return this.api.put<SalesOrderDetail, SalesOrderUpsertRequest>(
      `sales-orders/${encodeURIComponent(id)}`,
      request,
    );
  }

  confirm(id: string): Observable<SalesOrderDetail> {
    return this.api.post<SalesOrderDetail, Record<string, never>>(
      `sales-orders/${encodeURIComponent(id)}/confirm`,
      {},
    );
  }

  cancel(id: string): Observable<SalesOrderDetail> {
    return this.api.post<SalesOrderDetail, Record<string, never>>(
      `sales-orders/${encodeURIComponent(id)}/cancel`,
      {},
    );
  }

  dispatch(id: string): Observable<SalesOrderDetail> {
    return this.api.post<SalesOrderDetail, Record<string, never>>(
      `sales-orders/${encodeURIComponent(id)}/dispatch`,
      {},
    );
  }

  complete(id: string): Observable<SalesOrderDetail> {
    return this.api.post<SalesOrderDetail, Record<string, never>>(
      `sales-orders/${encodeURIComponent(id)}/complete`,
      {},
    );
  }

  createReturn(id: string, request: SalesReturnRequest): Observable<SalesReturnSummary> {
    return this.api.post<SalesReturnSummary, SalesReturnRequest>(
      `sales-orders/${encodeURIComponent(id)}/returns`,
      request,
    );
  }
}
