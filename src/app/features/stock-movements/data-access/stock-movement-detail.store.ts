import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { StockMovementApiService } from './stock-movement-api.service';
import { StockMovementDetail } from '../models/stock-movement.model';

@Injectable()
export class StockMovementDetailStore {
  private readonly api = inject(StockMovementApiService);

  private readonly movementState = signal<StockMovementDetail | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');

  readonly movement = this.movementState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  load(id: string): void {
    this.loadingState.set(true);
    this.errorState.set('');

    this.api
      .get(id)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (movement) => this.movementState.set(movement),
        error: (error: unknown) => {
          this.errorState.set(
            error instanceof ApiHttpError
              ? error.message
              : 'Unable to load stock movement.',
          );
        },
      });
  }
}
