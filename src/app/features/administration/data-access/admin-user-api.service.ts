import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  AdminUserDetail,
  AdminUserFormOptions,
  AdminUserStatusRequest,
  AdminUserSummary,
  AdminUserUpsertRequest,
} from '../models/admin-user.model';
import { AdminUserQuery } from '../models/admin-user-query.model';

@Injectable({ providedIn: 'root' })
export class AdminUserApiService {
  private readonly api = inject(ApiClient);

  list(query: AdminUserQuery): Observable<PaginatedResponse<AdminUserSummary>> {
    return this.api.get<PaginatedResponse<AdminUserSummary>>('administration/users', {
      params: query,
    });
  }

  get(id: string): Observable<AdminUserDetail> {
    return this.api.get<AdminUserDetail>(
      `administration/users/${encodeURIComponent(id)}`,
    );
  }

  getFormOptions(): Observable<AdminUserFormOptions> {
    return this.api.get<AdminUserFormOptions>('administration/users/form-options');
  }

  create(request: AdminUserUpsertRequest): Observable<AdminUserDetail> {
    return this.api.post<AdminUserDetail, AdminUserUpsertRequest>(
      'administration/users',
      request,
    );
  }

  update(id: string, request: AdminUserUpsertRequest): Observable<AdminUserDetail> {
    return this.api.put<AdminUserDetail, AdminUserUpsertRequest>(
      `administration/users/${encodeURIComponent(id)}`,
      request,
    );
  }

  setActive(id: string, active: boolean): Observable<AdminUserDetail> {
    const request: AdminUserStatusRequest = { active };

    return this.api.patch<AdminUserDetail, AdminUserStatusRequest>(
      `administration/users/${encodeURIComponent(id)}/status`,
      request,
    );
  }
}
