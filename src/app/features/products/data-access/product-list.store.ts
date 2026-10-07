import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { toActiveFilter } from '../../../shared/models/active-status-filter';
import {
  DEFAULT_PAGINATION,
  EMPTY_PAGINATION,
  PaginationMeta,
} from '../../../shared/models/pagination.model';
import { ProductApiService } from './product-api.service';
import { ProductFormOptions, ProductSummary } from '../models/product.model';
import { ProductQuery } from '../models/product-query.model';

export interface ProductFilters {
  readonly search: string;
  readonly categoryId: string;
  readonly unitId: string;
  readonly status: string;
}

@Injectable()
export class ProductListStore {
  private readonly api = inject(ProductApiService);

  private readonly productsState = signal<readonly ProductSummary[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly optionsState = signal<ProductFormOptions | null>(null);
  private readonly queryState = signal<ProductQuery>({
    ...DEFAULT_PAGINATION,
    sort: 'name',
    direction: 'asc',
    active: true,
  });
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');

  readonly products = this.productsState.asReadonly();
  readonly pagination = this.paginationState.asReadonly();
  readonly options = this.optionsState.asReadonly();
  readonly query = this.queryState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasProducts = computed(() => this.productsState().length > 0);

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
          next: (response) => this.applyList(response.data, response.pagination),
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
          this.applyList(list.data, list.pagination);
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  applyFilters(filters: ProductFilters): void {
    this.queryState.update((query) => ({
      ...query,
      page: 1,
      search: filters.search.trim() || undefined,
      categoryId: filters.categoryId || undefined,
      unitId: filters.unitId || undefined,
      active: toActiveFilter(filters.status),
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

  private applyList(products: readonly ProductSummary[], pagination: PaginationMeta): void {
    this.productsState.set(products);
    this.paginationState.set(pagination);
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load products.',
    );
  }
}
