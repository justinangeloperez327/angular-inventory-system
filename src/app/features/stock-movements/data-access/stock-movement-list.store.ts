import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import {
  DEFAULT_PAGINATION,
  PaginationMeta,
} from '../../../shared/models/pagination.model';
import { StockMovementApiService } from './stock-movement-api.service';
import {
  StockMovementFormOptions,
  StockMovementSummary,
  StockMovementType,
} from '../models/stock-movement.model';
import {
  StockMovementFilters,
  StockMovementQuery,
} from '../models/stock-movement-query.model';

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: DEFAULT_PAGINATION.pageSize,
  totalItems: 0,
  totalPages: 0,
};

@Injectable()
export class StockMovementListStore {
  private readonly api = inject(StockMovementApiService);

  private readonly movementsState = signal<readonly StockMovementSummary[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly optionsState = signal<StockMovementFormOptions | null>(null);
  private readonly queryState = signal<StockMovementQuery>({
    ...DEFAULT_PAGINATION,
    sort: 'occurredAt',
    direction: 'desc',
  });
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');

  readonly movements = this.movementsState.asReadonly();
  readonly pagination = this.paginationState.asReadonly();
  readonly options = this.optionsState.asReadonly();
  readonly query = this.queryState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasMovements = computed(() => this.movementsState().length > 0);

  initialize(query: Partial<StockMovementQuery>): void {
    this.queryState.update((current) => ({
      ...current,
      ...query,
      page: 1,
    }));
    this.load();
  }

  load(): void {
    if (this.loadingState()) {
      return;
    }

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
      movements: listRequest,
      options: this.api.getFormOptions(),
    })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ movements, options }) => {
          this.optionsState.set(options);
          this.applyResponse(movements.data, movements.pagination);
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  applyFilters(filters: StockMovementFilters): void {
    this.queryState.update((query) => ({
      ...query,
      page: 1,
      search: filters.search.trim() || undefined,
      warehouseId: filters.warehouseId || undefined,
      type: this.toType(filters.type),
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      reference: filters.reference.trim() || undefined,
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

  private toType(value: string): StockMovementType | undefined {
    const supported: readonly StockMovementType[] = [
      'receipt',
      'sale',
      'transfer-in',
      'transfer-out',
      'adjustment-in',
      'adjustment-out',
      'return-in',
      'return-out',
      'stock-count',
    ];

    return supported.includes(value as StockMovementType)
      ? (value as StockMovementType)
      : undefined;
  }

  private applyResponse(
    movements: readonly StockMovementSummary[],
    pagination: PaginationMeta,
  ): void {
    this.movementsState.set(movements);
    this.paginationState.set(pagination);
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load stock movements.',
    );
  }
}
