import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { SalesOrderApiService } from './sales-order-api.service';
import { SalesOrderDetail } from '../models/sales-order.model';

type SalesOrderAction = 'confirm' | 'cancel' | 'dispatch' | 'complete';

@Injectable()
export class SalesOrderDetailStore {
  private readonly api = inject(SalesOrderApiService);

  private readonly itemState = signal<SalesOrderDetail | null>(null);
  private readonly loadingState = signal(false);
  private readonly actionState = signal<SalesOrderAction | null>(null);
  private readonly errorState = signal('');

  readonly item = this.itemState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly action = this.actionState.asReadonly();
  readonly error = this.errorState.asReadonly();

  load(id: string): void {
    this.loadingState.set(true);
    this.errorState.set('');

    this.api.get(id).pipe(finalize(() => this.loadingState.set(false))).subscribe({
      next: (item) => this.itemState.set(item),
      error: (error: unknown) => this.setError(error),
    });
  }

  confirm(id: string): void {
    this.runAction('confirm', () => this.api.confirm(id));
  }

  cancel(id: string): void {
    this.runAction('cancel', () => this.api.cancel(id));
  }

  dispatch(id: string): void {
    this.runAction('dispatch', () => this.api.dispatch(id));
  }

  complete(id: string): void {
    this.runAction('complete', () => this.api.complete(id));
  }

  private runAction(
    action: SalesOrderAction,
    request: () => ReturnType<SalesOrderApiService['confirm']>,
  ): void {
    if (this.actionState()) return;

    this.actionState.set(action);
    this.errorState.set('');

    request().pipe(finalize(() => this.actionState.set(null))).subscribe({
      next: (item) => this.itemState.set(item),
      error: (error: unknown) => this.setError(error),
    });
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load sales order.',
    );
  }
}
