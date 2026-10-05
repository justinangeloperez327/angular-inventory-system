import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { InventoryApiService } from './inventory-api.service';
import { ProductInventorySnapshot } from '../models/inventory.model';

@Injectable()
export class ProductInventoryStore {
  private readonly api = inject(InventoryApiService);

  private readonly snapshotState = signal<ProductInventorySnapshot | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');
  private productId = '';

  readonly snapshot = this.snapshotState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  load(productId: string, page = 1): void {
    if (this.loadingState()) {
      return;
    }

    this.productId = productId;
    this.loadingState.set(true);
    this.errorState.set('');

    this.api
      .getProductInventory(productId, page)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (snapshot) => this.snapshotState.set(snapshot),
        error: (error: unknown) => this.setError(error),
      });
  }

  setPage(page: number): void {
    if (this.productId) {
      this.load(this.productId, page);
    }
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load product inventory.',
    );
  }
}
