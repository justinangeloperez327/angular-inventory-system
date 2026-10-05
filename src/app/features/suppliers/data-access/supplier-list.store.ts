import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import {
  DEFAULT_PAGINATION,
  PaginationMeta,
} from '../../../shared/models/pagination.model';
import { SupplierApiService } from './supplier-api.service';
import { SupplierSummary } from '../models/supplier.model';
import { SupplierFilters, SupplierQuery } from '../models/supplier-query.model';

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: DEFAULT_PAGINATION.pageSize,
  totalItems: 0,
  totalPages: 0,
};

@Injectable()
export class SupplierListStore {
  private readonly api = inject(SupplierApiService);

  private readonly suppliersState = signal<readonly SupplierSummary[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly queryState = signal<SupplierQuery>({
    ...DEFAULT_PAGINATION,
    sort: 'name',
    direction: 'asc',
    active: true,
  });
  private readonly loadingState = signal(false);
  private readonly statusUpdatingState = signal<string | null>(null);
  private readonly errorState = signal('');

  readonly suppliers = this.suppliersState.asReadonly();
  readonly pagination = this.paginationState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly statusUpdatingId = this.statusUpdatingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasSuppliers = computed(() => this.suppliersState().length > 0);

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
          this.suppliersState.set(response.data);
          this.paginationState.set(response.pagination);
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  applyFilters(filters: SupplierFilters): void {
    const active =
      filters.status === '' ? undefined : filters.status === 'active';

    this.queryState.update((query) => ({
      ...query,
      page: 1,
      search: filters.search.trim() || undefined,
      active,
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
      error instanceof ApiHttpError ? error.message : 'Unable to load suppliers.',
    );
  }
}
