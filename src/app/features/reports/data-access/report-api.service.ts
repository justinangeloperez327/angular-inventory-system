import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import {
  ReportId,
  ReportOptions,
  ReportQuery,
  ReportResponse,
} from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportApiService {
  private readonly api = inject(ApiClient);

  getOptions(): Observable<ReportOptions> {
    return this.api.get<ReportOptions>('reports/options');
  }

  run(id: ReportId, query: ReportQuery): Observable<ReportResponse> {
    return this.api.get<ReportResponse>(`reports/${encodeURIComponent(id)}`, {
      params: query,
    });
  }

  exportCsv(id: ReportId, query: ReportQuery): Observable<Blob> {
    const filters = {
      search: query.search,
      sort: query.sort,
      direction: query.direction,
      warehouseId: query.warehouseId,
      movementType: query.movementType,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      format: 'csv',
    };

    return this.api.getBlob(
      `reports/${encodeURIComponent(id)}/export`,
      { params: filters },
    );
  }
}
