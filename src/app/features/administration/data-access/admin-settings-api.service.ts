import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import {
  ApplicationSettings,
  ApplicationSettingsOptions,
  ApplicationSettingsUpdateRequest,
} from '../models/admin-settings.model';

@Injectable({ providedIn: 'root' })
export class AdminSettingsApiService {
  private readonly api = inject(ApiClient);

  get(): Observable<ApplicationSettings> {
    return this.api.get<ApplicationSettings>('administration/settings');
  }

  getOptions(): Observable<ApplicationSettingsOptions> {
    return this.api.get<ApplicationSettingsOptions>('administration/settings/options');
  }

  update(request: ApplicationSettingsUpdateRequest): Observable<ApplicationSettings> {
    return this.api.put<ApplicationSettings, ApplicationSettingsUpdateRequest>(
      'administration/settings',
      request,
    );
  }
}
