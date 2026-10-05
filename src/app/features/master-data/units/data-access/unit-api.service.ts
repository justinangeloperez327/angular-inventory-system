import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../../shared/models/pagination.model';
import { MasterDataQuery } from '../../models/master-data-query.model';
import { Unit, UnitStatusRequest, UnitUpsertRequest } from '../models/unit.model';

@Injectable({ providedIn: 'root' })
export class UnitApiService {
  private readonly api = inject(ApiClient);

  list(query: MasterDataQuery): Observable<PaginatedResponse<Unit>> {
    return this.api.get<PaginatedResponse<Unit>>('units', { params: query });
  }

  get(id: string): Observable<Unit> {
    return this.api.get<Unit>(`units/${encodeURIComponent(id)}`);
  }

  create(request: UnitUpsertRequest): Observable<Unit> {
    return this.api.post<Unit, UnitUpsertRequest>('units', request);
  }

  update(id: string, request: UnitUpsertRequest): Observable<Unit> {
    return this.api.put<Unit, UnitUpsertRequest>(`units/${encodeURIComponent(id)}`, request);
  }

  setActive(id: string, active: boolean): Observable<Unit> {
    const request: UnitStatusRequest = { active };
    return this.api.patch<Unit, UnitStatusRequest>(
      `units/${encodeURIComponent(id)}/status`,
      request,
    );
  }
}
