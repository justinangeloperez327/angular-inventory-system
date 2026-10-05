import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { AuthorizationService } from '../../../core/auth/authorization.service';
import { PERMISSIONS } from '../../../core/auth/permissions';
import { ApiHttpError } from '../../../core/http/api-http-error';
import { SupplierApiService } from './supplier-api.service';
import { SupplierPurchaseHistory } from '../models/supplier-purchase-history.model';
import { SupplierDetail } from '../models/supplier.model';

@Injectable()
export class SupplierDetailStore {
  private readonly api = inject(SupplierApiService);
  private readonly authorization = inject(AuthorizationService);

  private readonly supplierState = signal<SupplierDetail | null>(null);
  private readonly historyState = signal<SupplierPurchaseHistory | null>(null);
  private readonly loadingState = signal(false);
  private readonly historyLoadingState = signal(false);
  private readonly statusUpdatingState = signal(false);
  private readonly errorState = signal('');
  private readonly historyErrorState = signal('');
  private supplierId = '';

  readonly supplier = this.supplierState.asReadonly();
  readonly purchaseHistory = this.historyState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly historyLoading = this.historyLoadingState.asReadonly();
  readonly statusUpdating = this.statusUpdatingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly historyError = this.historyErrorState.asReadonly();

  load(id: string): void {
    this.supplierId = id;
    this.loadingState.set(true);
    this.errorState.set('');

    this.api
      .get(id)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (supplier) => {
          this.supplierState.set(supplier);

          if (this.authorization.hasPermission(PERMISSIONS.purchaseView)) {
            this.loadHistory(1);
          }
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  setHistoryPage(page: number): void {
    this.loadHistory(page);
  }

  setActive(active: boolean): void {
    if (!this.supplierId || this.statusUpdatingState()) {
      return;
    }

    this.statusUpdatingState.set(true);
    this.errorState.set('');

    this.api
      .setActive(this.supplierId, active)
      .pipe(finalize(() => this.statusUpdatingState.set(false)))
      .subscribe({
        next: (supplier) => this.supplierState.set(supplier),
        error: (error: unknown) => this.setError(error),
      });
  }

  private loadHistory(page: number): void {
    if (
      !this.supplierId ||
      this.historyLoadingState() ||
      !this.authorization.hasPermission(PERMISSIONS.purchaseView)
    ) {
      return;
    }

    this.historyLoadingState.set(true);
    this.historyErrorState.set('');

    this.api
      .purchaseHistory(this.supplierId, page)
      .pipe(finalize(() => this.historyLoadingState.set(false)))
      .subscribe({
        next: (history) => this.historyState.set(history),
        error: (error: unknown) => {
          this.historyErrorState.set(
            error instanceof ApiHttpError
              ? error.message
              : 'Unable to load purchase history.',
          );
        },
      });
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load supplier.',
    );
  }
}
