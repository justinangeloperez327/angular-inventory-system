import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { InventoryApiService } from './inventory-api.service';
import { WarehouseInventorySnapshot } from '../models/inventory.model';

@Injectable()
export class WarehouseInventoryStore {
  private readonly api = inject(InventoryApiService);

  private readonly snapshotState = signal<WarehouseInventorySnapshot | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');
  private warehouseId = '';

  readonly snapshot = this.snapshotState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  load(warehouseId: string, page = 1): void {
    if (this.loadingState()) {
      return;
    }

    this.warehouseId = warehouseId;
    this.loadingState.set(true);
    this.errorState.set('');

    this.api
      .getWarehouseInventory(warehouseId, page)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (snapshot) => this.snapshotState.set(snapshot),
        error: (error: unknown) => this.setError(error),
      });
  }

  setPage(page: number): void {
    if (this.warehouseId) {
      this.load(this.warehouseId, page);
    }
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load warehouse inventory.',
    );
  }
}
