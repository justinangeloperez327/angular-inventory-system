import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../../shared/models/pagination.model';
import { MasterDataQuery } from '../../models/master-data-query.model';
import {
  Warehouse,
  WarehouseStatusRequest,
  WarehouseUpsertRequest,
} from '../models/warehouse.model';

@Injectable({ providedIn: 'root' })
export class WarehouseApiService {
  private readonly api = inject(ApiClient);

  list(query: MasterDataQuery): Observable<PaginatedResponse<Warehouse>> {
    return this.api.get<PaginatedResponse<Warehouse>>('warehouses', { params: query });
  }

  get(id: string): Observable<Warehouse> {
    return this.api.get<Warehouse>(`warehouses/${encodeURIComponent(id)}`);
  }

  create(request: WarehouseUpsertRequest): Observable<Warehouse> {
    return this.api.post<Warehouse, WarehouseUpsertRequest>('warehouses', request);
  }

  update(id: string, request: WarehouseUpsertRequest): Observable<Warehouse> {
    return this.api.put<Warehouse, WarehouseUpsertRequest>(
      `warehouses/${encodeURIComponent(id)}`,
      request,
    );
  }

  setActive(id: string, active: boolean): Observable<Warehouse> {
    const request: WarehouseStatusRequest = { active };
    return this.api.patch<Warehouse, WarehouseStatusRequest>(
      `warehouses/${encodeURIComponent(id)}/status`,
      request,
    );
  }
}
