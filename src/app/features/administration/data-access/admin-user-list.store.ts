import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { DEFAULT_PAGINATION, PaginationMeta } from '../../../shared/models/pagination.model';
import { AdminUserApiService } from './admin-user-api.service';
import {
  AdminUserFormOptions,
  AdminUserSummary,
} from '../models/admin-user.model';
import {
  AdminUserFilters,
  AdminUserQuery,
} from '../models/admin-user-query.model';

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: DEFAULT_PAGINATION.pageSize,
  totalItems: 0,
  totalPages: 0,
};

@Injectable()
export class AdminUserListStore {
  private readonly api = inject(AdminUserApiService);

  private readonly itemsState = signal<readonly AdminUserSummary[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly optionsState = signal<AdminUserFormOptions | null>(null);
  private readonly queryState = signal<AdminUserQuery>({
    ...DEFAULT_PAGINATION,
    sort: 'name',
    direction: 'asc',
    active: true,
  });
  private readonly loadingState = signal(false);
  private readonly statusUpdatingState = signal<string | null>(null);
  private readonly errorState = signal('');

  readonly items = this.itemsState.asReadonly();
  readonly pagination = this.paginationState.asReadonly();
  readonly options = this.optionsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly statusUpdatingId = this.statusUpdatingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasItems = computed(() => this.itemsState().length > 0);

  load(): void {
    if (this.loadingState()) return;

    this.loadingState.set(true);
    this.errorState.set('');

    this.api
      .list(this.queryState())
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => this.applyResponse(response.data, response.pagination),
        error: (error: unknown) => this.setError(error),
      });

    this.loadOptions();
  }

  applyFilters(filters: AdminUserFilters): void {
    this.queryState.update((query) => ({
      ...query,
      page: 1,
      search: filters.search.trim() || undefined,
      roleId: filters.roleId || undefined,
      active: filters.status === '' ? undefined : filters.status === 'active',
    }));
    this.load();
  }

  setPage(page: number): void {
    this.queryState.update((query) => ({ ...query, page }));
    this.load();
  }

  setActive(id: string, active: boolean): void {
    if (this.statusUpdatingState()) return;

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

  private loadOptions(): void {
    if (this.optionsState()) return;

    this.api.getFormOptions().subscribe({
      next: (options) => this.optionsState.set(options),
      error: () => {
        // User listing remains available even if optional role filter metadata fails.
      },
    });
  }

  private applyResponse(
    items: readonly AdminUserSummary[],
    pagination: PaginationMeta,
  ): void {
    this.itemsState.set(items);
    this.paginationState.set(pagination);
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load users.',
    );
  }
}
