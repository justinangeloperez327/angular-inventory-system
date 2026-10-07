import {
  EMPTY_PAGINATION,
  computed,
  inject,
  Injectable,
  signal } from '@angular/core';
import { finalize,
  forkJoin } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import {
  DEFAULT_PAGINATION,
  PaginationMeta,
} from '../../../shared/models/pagination.model';
import { PurchaseOrderApiService } from './purchase-order-api.service';
import {
  PurchaseOrderFormOptions,
  PurchaseOrderStatus,
  PurchaseOrderSummary,
} from '../models/purchase-order.model';
import {
  PurchaseOrderFilters,
  PurchaseOrderQuery,
} from '../models/purchase-order-query.model';


@Injectable()
export class PurchaseOrderListStore {
  private readonly api = inject(PurchaseOrderApiService);

  private readonly itemsState = signal<readonly PurchaseOrderSummary[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly optionsState = signal<PurchaseOrderFormOptions | null>(null);
  private readonly queryState = signal<PurchaseOrderQuery>({
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

  applyFilters(filters: PurchaseOrderFilters): void {
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

  private toStatus(value: string): PurchaseOrderStatus | undefined {
    const supported: readonly PurchaseOrderStatus[] = [
      'draft',
      'submitted',
      'approved',
      'partially-received',
      'received',
      'cancelled',
    ];

    return supported.includes(value as PurchaseOrderStatus)
      ? (value as PurchaseOrderStatus)
      : undefined;
  }

  private applyResponse(
    items: readonly PurchaseOrderSummary[],
    pagination: PaginationMeta,
  ): void {
    this.itemsState.set(items);
    this.paginationState.set(pagination);
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load purchase orders.',
    );
  }
}
