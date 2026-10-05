import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  StockCountCreateRequest,
  StockCountDetail,
  StockCountFormOptions,
  StockCountLine,
  StockCountLineUpdateRequest,
  StockCountSummary,
} from '../models/stock-count.model';
import {
  StockCountLineQuery,
  StockCountQuery,
} from '../models/stock-count-query.model';

@Injectable({ providedIn: 'root' })
export class StockCountApiService {
  private readonly api = inject(ApiClient);

  list(query: StockCountQuery): Observable<PaginatedResponse<StockCountSummary>> {
    return this.api.get<PaginatedResponse<StockCountSummary>>('stock-counts', {
      params: query,
    });
  }

  get(id: string): Observable<StockCountDetail> {
    return this.api.get<StockCountDetail>(`stock-counts/${encodeURIComponent(id)}`);
  }

  getLines(
    id: string,
    query: StockCountLineQuery,
  ): Observable<PaginatedResponse<StockCountLine>> {
    return this.api.get<PaginatedResponse<StockCountLine>>(
      `stock-counts/${encodeURIComponent(id)}/lines`,
      { params: query },
    );
  }

  getFormOptions(): Observable<StockCountFormOptions> {
    return this.api.get<StockCountFormOptions>('stock-counts/form-options');
  }

  create(request: StockCountCreateRequest): Observable<StockCountDetail> {
    return this.api.post<StockCountDetail, StockCountCreateRequest>('stock-counts', request);
  }

  start(id: string): Observable<StockCountDetail> {
    return this.api.post<StockCountDetail, Record<string, never>>(
      `stock-counts/${encodeURIComponent(id)}/start`,
      {},
    );
  }

  saveLines(
    id: string,
    request: StockCountLineUpdateRequest,
    query: StockCountLineQuery,
  ): Observable<PaginatedResponse<StockCountLine>> {
    return this.api.put<PaginatedResponse<StockCountLine>, StockCountLineUpdateRequest>(
      `stock-counts/${encodeURIComponent(id)}/lines`,
      request,
      { params: query },
    );
  }

  submit(id: string): Observable<StockCountDetail> {
    return this.api.post<StockCountDetail, Record<string, never>>(
      `stock-counts/${encodeURIComponent(id)}/submit`,
      {},
    );
  }

  approveAndPost(id: string): Observable<StockCountDetail> {
    return this.api.post<StockCountDetail, Record<string, never>>(
      `stock-counts/${encodeURIComponent(id)}/approve-and-post`,
      {},
    );
  }
}
