import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { DashboardSnapshot } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly api = inject(ApiClient);

  getDashboard(): Observable<DashboardSnapshot> {
    return this.api.get<DashboardSnapshot>('dashboard');
  }
}
