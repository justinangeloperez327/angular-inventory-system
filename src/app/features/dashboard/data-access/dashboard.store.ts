import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { DashboardApiService } from './dashboard-api.service';
import { DashboardSnapshot } from '../models/dashboard.model';

@Injectable()
export class DashboardStore {
  private readonly api = inject(DashboardApiService);

  private readonly snapshotState = signal<DashboardSnapshot | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');

  readonly snapshot = this.snapshotState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly metrics = computed(() => this.snapshotState()?.metrics ?? null);
  readonly hasData = computed(() => this.snapshotState() !== null);

  load(force = false): void {
    if (this.loadingState() || (!force && this.snapshotState())) {
      return;
    }

    this.loadingState.set(true);
    this.errorState.set('');

    this.api
      .getDashboard()
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (snapshot) => this.snapshotState.set(snapshot),
        error: (error: unknown) => {
          this.errorState.set(
            error instanceof ApiHttpError
              ? error.message
              : 'Unable to load the dashboard.',
          );
        },
      });
  }

  refresh(): void {
    this.load(true);
  }
}
