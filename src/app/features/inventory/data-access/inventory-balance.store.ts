import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import {
  DEFAULT_PAGINATION,
  PaginationMeta,
} from '../../../shared/models/pagination.model';
import { InventoryApiService } from './inventory-api.service';
import {
  InventoryBalance,
  InventoryFormOptions,
  InventoryStockStatus,
} from '../models/inventory.model';
import {
  InventoryBalanceFilters,
  InventoryBalanceQuery,
} from '../models/inventory-query.model';

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: DEFAULT_PAGINATION.pageSize,
  totalItems: 0,
  totalPages: 0,
};

@Injectable()
export class InventoryBalanceStore {
  private readonly api = inject(InventoryApiService);

  private readonly balancesState = signal<readonly InventoryBalance[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly optionsState = signal<InventoryFormOptions | null>(null);
  private readonly queryState = signal<InventoryBalanceQuery>({
    ...DEFAULT_PAGINATION,
    sort: 'productName',
    direction: 'asc',
  });
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');

  readonly balances = this.balancesState.asReadonly();
  readonly pagination = this.paginationState.asReadonly();
  readonly options = this.optionsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasBalances = computed(() => this.balancesState().length > 0);

  load(): void {
    if (this.loadingState()) {
      return;
    }

    this.loadingState.set(true);
    this.errorState.set('');

    const balancesRequest = this.api.listBalances(this.queryState());

    if (this.optionsState()) {
      balancesRequest
        .pipe(finalize(() => this.loadingState.set(false)))
        .subscribe({
          next: (response) => this.applyResponse(response.data, response.pagination),
          error: (error: unknown) => this.setError(error),
        });
      return;
    }

    forkJoin({
      balances: balancesRequest,
      options: this.api.getFormOptions(),
    })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ balances, options }) => {
          this.optionsState.set(options);
          this.applyResponse(balances.data, balances.pagination);
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  applyFilters(filters: InventoryBalanceFilters): void {
    const status = this.toStatus(filters.status);

    this.queryState.update((query) => ({
      ...query,
      page: 1,
      search: filters.search.trim() || undefined,
      warehouseId: filters.warehouseId || undefined,
      status,
    }));

    this.load();
  }

  setPage(page: number): void {
    this.queryState.update((query) => ({ ...query, page }));
    this.load();
  }

  refresh(): void {
    this.load();
  }

  private toStatus(value: string): InventoryStockStatus | undefined {
    return value === 'in-stock' || value === 'low-stock' || value === 'out-of-stock'
      ? value
      : undefined;
  }

  private applyResponse(
    balances: readonly InventoryBalance[],
    pagination: PaginationMeta,
  ): void {
    this.balancesState.set(balances);
    this.paginationState.set(pagination);
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load inventory balances.',
    );
  }
}
