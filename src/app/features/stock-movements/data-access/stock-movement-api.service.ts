import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  StockMovementDetail,
  StockMovementFormOptions,
  StockMovementSummary,
} from '../models/stock-movement.model';
import { StockMovementQuery } from '../models/stock-movement-query.model';

@Injectable({ providedIn: 'root' })
export class StockMovementApiService {
  private readonly api = inject(ApiClient);

  list(query: StockMovementQuery): Observable<PaginatedResponse<StockMovementSummary>> {
    return this.api.get<PaginatedResponse<StockMovementSummary>>('stock-movements', {
      params: query,
    });
  }

  get(id: string): Observable<StockMovementDetail> {
    return this.api.get<StockMovementDetail>(
      `stock-movements/${encodeURIComponent(id)}`,
    );
  }

  getFormOptions(): Observable<StockMovementFormOptions> {
    return this.api.get<StockMovementFormOptions>('stock-movements/form-options');
  }
}
