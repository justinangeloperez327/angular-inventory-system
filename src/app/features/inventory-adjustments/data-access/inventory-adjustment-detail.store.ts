import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { InventoryAdjustmentApiService } from './inventory-adjustment-api.service';
import { InventoryAdjustmentDetail } from '../models/inventory-adjustment.model';

@Injectable()
export class InventoryAdjustmentDetailStore {
  private readonly api = inject(InventoryAdjustmentApiService);

  private readonly itemState = signal<InventoryAdjustmentDetail | null>(null);
  private readonly loadingState = signal(false);
  private readonly postingState = signal(false);
  private readonly errorState = signal('');

  readonly item = this.itemState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly posting = this.postingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  load(id: string): void {
    this.loadingState.set(true);
    this.errorState.set('');

    this.api
      .get(id)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (item) => this.itemState.set(item),
        error: (error: unknown) => this.setError(error),
      });
  }

  post(id: string): void {
    if (this.postingState()) return;

    this.postingState.set(true);
    this.errorState.set('');

    this.api
      .post(id)
      .pipe(finalize(() => this.postingState.set(false)))
      .subscribe({
        next: (item) => this.itemState.set(item),
        error: (error: unknown) => this.setError(error),
      });
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError
        ? error.message
        : 'Unable to load inventory adjustment.',
    );
  }
}
