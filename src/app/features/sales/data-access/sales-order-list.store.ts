import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { DEFAULT_PAGINATION, PaginationMeta } from '../../../shared/models/pagination.model';
import { SalesOrderApiService } from './sales-order-api.service';
import {
  SalesOrderFormOptions,
  SalesOrderStatus,
  SalesOrderSummary,
} from '../models/sales-order.model';
import {
  SalesOrderFilters,
  SalesOrderQuery,
} from '../models/sales-order-query.model';

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: DEFAULT_PAGINATION.pageSize,
  totalItems: 0,
  totalPages: 0,
};

@Injectable()
export class SalesOrderListStore {
  private readonly api = inject(SalesOrderApiService);

  private readonly itemsState = signal<readonly SalesOrderSummary[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly optionsState = signal<SalesOrderFormOptions | null>(null);
  private readonly queryState = signal<SalesOrderQuery>({
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

  initialize(customerId?: string): void {
    if (customerId) {
      this.queryState.update((query) => ({ ...query, customerId, page: 1 }));
    }
    this.load();
  }

  load(): void {
    if (this.loadingState()) return;

    this.loadingState.set(true);
    this.errorState.set('');

    const listRequest = this.api.list(this.queryState());

    if (this.optionsState()) {
      listRequest.pipe(finalize(() => this.loadingState.set(false))).subscribe({
        next: (response) => this.applyResponse(response.data, response.pagination),
        error: (error: unknown) => this.setError(error),
      });
      return;
    }

    forkJoin({ list: listRequest, options: this.api.getFormOptions() })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ list, options }) => {
          this.optionsState.set(options);
          this.applyResponse(list.data, list.pagination);
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  applyFilters(filters: SalesOrderFilters): void {
    this.queryState.update((query) => ({
      ...query,
      page: 1,
      search: filters.search.trim() || undefined,
      warehouseId: filters.warehouseId || undefined,
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

  private toStatus(value: string): SalesOrderStatus | undefined {
    const values: readonly SalesOrderStatus[] = [
      'draft', 'confirmed', 'dispatched', 'completed', 'cancelled',
    ];

    return values.includes(value as SalesOrderStatus)
      ? (value as SalesOrderStatus)
      : undefined;
  }

  private applyResponse(
    items: readonly SalesOrderSummary[],
    pagination: PaginationMeta,
  ): void {
    this.itemsState.set(items);
    this.paginationState.set(pagination);
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load sales orders.',
    );
  }
}
