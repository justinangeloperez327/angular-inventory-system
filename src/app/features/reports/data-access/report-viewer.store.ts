import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { DEFAULT_PAGINATION } from '../../../shared/models/pagination.model';
import { ReportApiService } from './report-api.service';
import {
  ReportDefinition,
  ReportOptions,
  ReportQuery,
  ReportResponse,
} from '../models/report.model';

@Injectable()
export class ReportViewerStore {
  private readonly api = inject(ReportApiService);

  private readonly definitionState = signal<ReportDefinition | null>(null);
  private readonly responseState = signal<ReportResponse | null>(null);
  private readonly optionsState = signal<ReportOptions | null>(null);
  private readonly queryState = signal<ReportQuery>({
    ...DEFAULT_PAGINATION,
  });
  private readonly loadingState = signal(false);
  private readonly exportingState = signal(false);
  private readonly errorState = signal('');

  readonly definition = this.definitionState.asReadonly();
  readonly response = this.responseState.asReadonly();
  readonly options = this.optionsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly exporting = this.exportingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly rows = computed(() => this.responseState()?.data ?? []);
  readonly pagination = computed(() => this.responseState()?.pagination ?? {
    page: 1,
    pageSize: DEFAULT_PAGINATION.pageSize,
    totalItems: 0,
    totalPages: 0,
  });

  initialize(definition: ReportDefinition): void {
    this.definitionState.set(definition);
    this.queryState.set({
      ...DEFAULT_PAGINATION,
      sort: definition.defaultSort,
      direction: definition.defaultDirection,
    });

    this.load();
    this.loadOptions();
  }

  applyFilters(filters: {
    search: string;
    warehouseId: string;
    movementType: string;
    dateFrom: string;
    dateTo: string;
  }): void {
    this.queryState.update((query) => ({
      ...query,
      page: 1,
      search: filters.search.trim() || undefined,
      warehouseId: filters.warehouseId || undefined,
      movementType: filters.movementType || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    }));
    this.load();
  }

  setPage(page: number): void {
    this.queryState.update((query) => ({ ...query, page }));
    this.load();
  }

  exportCsv(onReady: (blob: Blob) => void): void {
    const definition = this.definitionState();

    if (!definition || this.exportingState()) {
      return;
    }

    this.exportingState.set(true);
    this.errorState.set('');

    this.api
      .exportCsv(definition.id, this.queryState())
      .pipe(finalize(() => this.exportingState.set(false)))
      .subscribe({
        next: onReady,
        error: (error: unknown) => this.setError(error, 'Unable to export report.'),
      });
  }

  private load(): void {
    const definition = this.definitionState();

    if (!definition || this.loadingState()) {
      return;
    }

    this.loadingState.set(true);
    this.errorState.set('');

    this.api
      .run(definition.id, this.queryState())
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => this.responseState.set(response),
        error: (error: unknown) => this.setError(error, 'Unable to load report.'),
      });
  }

  private loadOptions(): void {
    if (this.optionsState()) {
      return;
    }

    this.api.getOptions().subscribe({
      next: (options) => this.optionsState.set(options),
      error: () => {
        // Report data remains usable even if optional filter metadata is unavailable.
      },
    });
  }

  private setError(error: unknown, fallback: string): void {
    this.errorState.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
