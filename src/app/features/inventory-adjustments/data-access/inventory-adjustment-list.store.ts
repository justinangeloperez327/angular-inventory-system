import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import {
  DEFAULT_PAGINATION,
  PaginationMeta,
} from '../../../shared/models/pagination.model';
import { InventoryAdjustmentApiService } from './inventory-adjustment-api.service';
import {
  InventoryAdjustmentDirection,
  InventoryAdjustmentFormOptions,
  InventoryAdjustmentStatus,
  InventoryAdjustmentSummary,
} from '../models/inventory-adjustment.model';
import {
  InventoryAdjustmentFilters,
  InventoryAdjustmentQuery,
} from '../models/inventory-adjustment-query.model';

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: DEFAULT_PAGINATION.pageSize,
  totalItems: 0,
  totalPages: 0,
};

@Injectable()
export class InventoryAdjustmentListStore {
  private readonly api = inject(InventoryAdjustmentApiService);

  private readonly itemsState = signal<readonly InventoryAdjustmentSummary[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly optionsState = signal<InventoryAdjustmentFormOptions | null>(null);
  private readonly queryState = signal<InventoryAdjustmentQuery>({
    ...DEFAULT_PAGINATION,
    sort: 'createdAt',
    direction: 'desc',
  });
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');

  readonly items = this.itemsState.asReadonly();
  readonly pagination = this.paginationState.asReadonly();
  readonly options = this.optionsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasItems = computed(() => this.itemsState().length > 0);

  load(): void {
    if (this.loadingState()) return;

    this.loadingState.set(true);
    this.errorState.set('');

    const listRequest = this.api.list(this.queryState());

    if (this.optionsState()) {
      listRequest
        .pipe(finalize(() => this.loadingState.set(false)))
        .subscribe({
          next: (response) => this.applyResponse(response.data, response.pagination),
          error: (error: unknown) => this.setError(error),
        });
      return;
    }

    forkJoin({
      list: listRequest,
      options: this.api.getFormOptions(),
    })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ list, options }) => {
          this.optionsState.set(options);
          this.applyResponse(list.data, list.pagination);
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  applyFilters(filters: InventoryAdjustmentFilters): void {
    this.queryState.update((query) => ({
      ...query,
      page: 1,
      search: filters.search.trim() || undefined,
      warehouseId: filters.warehouseId || undefined,
      adjustmentDirection: this.toDirection(filters.direction),
      status: this.toStatus(filters.status),
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
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

  private toDirection(value: string): InventoryAdjustmentDirection | undefined {
    return value === 'increase' || value === 'decrease' ? value : undefined;
  }

  private toStatus(value: string): InventoryAdjustmentStatus | undefined {
    return value === 'draft' || value === 'posted' || value === 'cancelled'
      ? value
      : undefined;
  }

  private applyResponse(
    items: readonly InventoryAdjustmentSummary[],
    pagination: PaginationMeta,
  ): void {
    this.itemsState.set(items);
    this.paginationState.set(pagination);
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError
        ? error.message
        : 'Unable to load inventory adjustments.',
    );
  }
}
