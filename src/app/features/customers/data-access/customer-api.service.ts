import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  CustomerDetail,
  CustomerStatusRequest,
  CustomerSummary,
  CustomerUpsertRequest,
} from '../models/customer.model';
import { CustomerQuery } from '../models/customer-query.model';

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly api = inject(ApiClient);

  list(query: CustomerQuery): Observable<PaginatedResponse<CustomerSummary>> {
    return this.api.get<PaginatedResponse<CustomerSummary>>('customers', { params: query });
  }

  get(id: string): Observable<CustomerDetail> {
    return this.api.get<CustomerDetail>(`customers/${encodeURIComponent(id)}`);
  }

  create(request: CustomerUpsertRequest): Observable<CustomerDetail> {
    return this.api.post<CustomerDetail, CustomerUpsertRequest>('customers', request);
  }

  update(id: string, request: CustomerUpsertRequest): Observable<CustomerDetail> {
    return this.api.put<CustomerDetail, CustomerUpsertRequest>(
      `customers/${encodeURIComponent(id)}`,
      request,
    );
  }

  setActive(id: string, active: boolean): Observable<CustomerDetail> {
    const request: CustomerStatusRequest = { active };

    return this.api.patch<CustomerDetail, CustomerStatusRequest>(
      `customers/${encodeURIComponent(id)}/status`,
      request,
    );
  }
}
