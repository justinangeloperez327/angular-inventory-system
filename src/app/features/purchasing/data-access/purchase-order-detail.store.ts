import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { PurchaseOrderApiService } from './purchase-order-api.service';
import { PurchaseOrderDetail } from '../models/purchase-order.model';

@Injectable()
export class PurchaseOrderDetailStore {
  private readonly api = inject(PurchaseOrderApiService);

  private readonly itemState = signal<PurchaseOrderDetail | null>(null);
  private readonly loadingState = signal(false);
  private readonly actionState = signal<'submit' | 'approve' | null>(null);
  private readonly errorState = signal('');

  readonly item = this.itemState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly action = this.actionState.asReadonly();
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

  submit(id: string): void {
    this.runAction('submit', () => this.api.submit(id));
  }

  approve(id: string): void {
    this.runAction('approve', () => this.api.approve(id));
  }

  private runAction(
    action: 'submit' | 'approve',
    request: () => ReturnType<PurchaseOrderApiService['submit']>,
  ): void {
    if (this.actionState()) return;

    this.actionState.set(action);
    this.errorState.set('');

    request()
      .pipe(finalize(() => this.actionState.set(null)))
      .subscribe({
        next: (item) => this.itemState.set(item),
        error: (error: unknown) => this.setError(error),
      });
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load purchase order.',
    );
  }
}
