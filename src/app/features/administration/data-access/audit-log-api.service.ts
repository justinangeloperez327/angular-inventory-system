import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  AuditLogEntry,
  AuditLogOptions,
  AuditLogQuery,
} from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogApiService {
  private readonly api = inject(ApiClient);

  list(query: AuditLogQuery): Observable<PaginatedResponse<AuditLogEntry>> {
    return this.api.get<PaginatedResponse<AuditLogEntry>>('administration/audit-log', {
      params: query,
    });
  }

  getOptions(): Observable<AuditLogOptions> {
    return this.api.get<AuditLogOptions>('administration/audit-log/options');
  }
}
