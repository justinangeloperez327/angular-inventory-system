import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import {
  DEFAULT_PAGINATION,
  EMPTY_PAGINATION,
  PaginationMeta,
} from '../../../shared/models/pagination.model';
import { StockCountApiService } from './stock-count-api.service';
import {
  StockCountFormOptions,
  StockCountStatus,
  StockCountSummary,
} from '../models/stock-count.model';
import {
  StockCountFilters,
  StockCountQuery,
} from '../models/stock-count-query.model';


@Injectable()
export class StockCountListStore {
  private readonly api = inject(StockCountApiService);

  private readonly itemsState = signal<readonly StockCountSummary[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly optionsState = signal<StockCountFormOptions | null>(null);
  private readonly queryState = signal<StockCountQuery>({
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

  applyFilters(filters: StockCountFilters): void {
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

  private toStatus(value: string): StockCountStatus | undefined {
    const values: readonly StockCountStatus[] = [
      'draft',
      'counting',
      'submitted',
      'posted',
      'cancelled',
    ];

    return values.includes(value as StockCountStatus)
      ? (value as StockCountStatus)
      : undefined;
  }

  private applyResponse(
    items: readonly StockCountSummary[],
    pagination: PaginationMeta,
  ): void {
    this.itemsState.set(items);
    this.paginationState.set(pagination);
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load stock counts.',
    );
  }
}
