import { computed, signal } from '@angular/core';
import { finalize, Observable } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { toActiveFilter } from '../../../shared/models/active-status-filter';
import {
  EMPTY_PAGINATION,
  PaginatedResponse,
  PaginationMeta,
} from '../../../shared/models/pagination.model';
import { MasterDataFilters, MasterDataQuery } from '../models/master-data-query.model';

export interface MasterDataListApi<T> {
  list(query: MasterDataQuery): Observable<PaginatedResponse<T>>;
  setActive(id: string, active: boolean): Observable<unknown>;
}

export abstract class MasterDataListStore<T> {
  private readonly itemsState = signal<readonly T[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly queryState = signal<MasterDataQuery>({
    page: 1,
    pageSize: EMPTY_PAGINATION.pageSize,
    sort: 'name',
    direction: 'asc',
    active: true,
  });
  private readonly loadingState = signal(false);
  private readonly statusUpdatingState = signal<string | null>(null);
  private readonly errorState = signal('');

  readonly items = this.itemsState.asReadonly();
  readonly pagination = this.paginationState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly statusUpdatingId = this.statusUpdatingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasItems = computed(() => this.itemsState().length > 0);

  protected constructor(
    private readonly api: MasterDataListApi<T>,
    private readonly resourceLabel: string,
  ) {}

  load(): void {
    if (this.loadingState()) {
      return;
    }

    this.loadingState.set(true);
    this.errorState.set('');

    this.api
      .list(this.queryState())
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => {
          this.itemsState.set(response.data);
          this.paginationState.set(response.pagination);
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  applyFilters(filters: MasterDataFilters): void {
    this.queryState.update((query) => ({
      ...query,
      page: 1,
      search: filters.search.trim() || undefined,
      active: toActiveFilter(filters.status),
    }));

    this.load();
  }

  setPage(page: number): void {
    this.queryState.update((query) => ({ ...query, page }));
    this.load();
  }

  setActive(id: string, active: boolean): void {
    if (this.statusUpdatingState()) {
      return;
    }

    this.statusUpdatingState.set(id);
    this.errorState.set('');

    this.api
      .setActive(id, active)
      .pipe(finalize(() => this.statusUpdatingState.set(null)))
      .subscribe({
        next: () => this.load(),
        error: (error: unknown) => this.setError(error),
      });
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError
        ? error.message
        : `Unable to load ${this.resourceLabel}.`,
    );
  }
}
