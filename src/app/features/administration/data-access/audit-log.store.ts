import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import {
  DEFAULT_PAGINATION,
  EMPTY_PAGINATION,
  PaginationMeta,
} from '../../../shared/models/pagination.model';
import { AuditLogApiService } from './audit-log-api.service';
import {
  AuditLogEntry,
  AuditLogFilters,
  AuditLogOptions,
  AuditLogQuery,
} from '../models/audit-log.model';


@Injectable()
export class AuditLogStore {
  private readonly api = inject(AuditLogApiService);

  private readonly itemsState = signal<readonly AuditLogEntry[]>([]);
  private readonly paginationState = signal<PaginationMeta>(EMPTY_PAGINATION);
  private readonly optionsState = signal<AuditLogOptions | null>(null);
  private readonly queryState = signal<AuditLogQuery>({
    ...DEFAULT_PAGINATION,
    sort: 'occurredAt',
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

    this.api
      .list(this.queryState())
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => this.applyResponse(response.data, response.pagination),
        error: (error: unknown) => this.setError(error),
      });

    this.loadOptions();
  }

  applyFilters(filters: AuditLogFilters): void {
    this.queryState.update((query) => ({
      ...query,
      page: 1,
      search: filters.search.trim() || undefined,
      area: filters.area || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    }));
    this.load();
  }

  setPage(page: number): void {
    this.queryState.update((query) => ({ ...query, page }));
    this.load();
  }

  private loadOptions(): void {
    if (this.optionsState()) return;

    this.api.getOptions().subscribe({
      next: (options) => this.optionsState.set(options),
      error: () => {
        // Audit history remains available even if optional area metadata fails.
      },
    });
  }

  private applyResponse(
    items: readonly AuditLogEntry[],
    pagination: PaginationMeta,
  ): void {
    this.itemsState.set(items);
    this.paginationState.set(pagination);
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load audit log.',
    );
  }
}
