import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import {
  DEFAULT_PAGINATION,
  EMPTY_PAGINATION,
  PaginationMeta,
} from '../../../shared/models/pagination.model';
import { GoodsReceiptApiService } from './goods-receipt-api.service';
import {
  GoodsReceiptFormOptions,
  GoodsReceiptStatus,
  GoodsReceiptSummary,
} from '../models/goods-receipt.model';
import {
  GoodsReceiptFilters,
  GoodsReceiptQuery,
} from '../models/goods-receipt-query.model';


@Injectable()
export class GoodsReceiptListStore {
  private readonly api = inject(GoodsReceiptApiService);

  private readonly itemsState = signal<readonly GoodsReceiptSummary[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly optionsState = signal<GoodsReceiptFormOptions | null>(null);
  private readonly queryState = signal<GoodsReceiptQuery>({
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

  initialize(query: Partial<GoodsReceiptQuery>): void {
    this.queryState.update((current) => ({ ...current, ...query, page: 1 }));
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

  applyFilters(filters: GoodsReceiptFilters): void {
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

  refresh(): void {
    this.load();
  }

  private toStatus(value: string): GoodsReceiptStatus | undefined {
    return value === 'draft' || value === 'posted' || value === 'cancelled'
      ? value
      : undefined;
  }

  private applyResponse(
    items: readonly GoodsReceiptSummary[],
    pagination: PaginationMeta,
  ): void {
    this.itemsState.set(items);
    this.paginationState.set(pagination);
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load goods receipts.',
    );
  }
}
