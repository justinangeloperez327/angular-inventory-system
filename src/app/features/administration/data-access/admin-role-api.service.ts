import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import {
  AdminRoleDetail,
  AdminRoleFormOptions,
  AdminRoleSummary,
  AdminRoleUpsertRequest,
} from '../models/admin-role.model';

@Injectable({ providedIn: 'root' })
export class AdminRoleApiService {
  private readonly api = inject(ApiClient);

  list(): Observable<readonly AdminRoleSummary[]> {
    return this.api.get<readonly AdminRoleSummary[]>('administration/roles');
  }

  get(id: string): Observable<AdminRoleDetail> {
    return this.api.get<AdminRoleDetail>(
      `administration/roles/${encodeURIComponent(id)}`,
    );
  }

  getFormOptions(): Observable<AdminRoleFormOptions> {
    return this.api.get<AdminRoleFormOptions>('administration/roles/form-options');
  }

  create(request: AdminRoleUpsertRequest): Observable<AdminRoleDetail> {
    return this.api.post<AdminRoleDetail, AdminRoleUpsertRequest>(
      'administration/roles',
      request,
    );
  }

  update(id: string, request: AdminRoleUpsertRequest): Observable<AdminRoleDetail> {
    return this.api.put<AdminRoleDetail, AdminRoleUpsertRequest>(
      `administration/roles/${encodeURIComponent(id)}`,
      request,
    );
  }
}
