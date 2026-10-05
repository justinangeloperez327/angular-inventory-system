import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { DEFAULT_PAGINATION } from '../../../shared/models/pagination.model';
import { StockCountApiService } from './stock-count-api.service';
import {
  StockCountDetail,
  StockCountLine,
  StockCountLineUpdate,
} from '../models/stock-count.model';
import { StockCountLineQuery } from '../models/stock-count-query.model';

@Injectable()
export class StockCountDetailStore {
  private readonly api = inject(StockCountApiService);

  private readonly countState = signal<StockCountDetail | null>(null);
  private readonly linesState = signal<readonly StockCountLine[]>([]);
  private readonly linePaginationState = signal({
    page: 1,
    pageSize: DEFAULT_PAGINATION.pageSize,
    totalItems: 0,
    totalPages: 0,
  });
  private readonly lineQueryState = signal<StockCountLineQuery>({
    ...DEFAULT_PAGINATION,
    sort: 'productName',
    direction: 'asc',
  });
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly actionState = signal<'start' | 'submit' | 'post' | null>(null);
  private readonly errorState = signal('');

  readonly count = this.countState.asReadonly();
  readonly lines = this.linesState.asReadonly();
  readonly linePagination = this.linePaginationState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly action = this.actionState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly allCounted = computed(() => {
    const count = this.countState();
    return !!count && count.lineCount > 0 && count.countedLineCount === count.lineCount;
  });

  load(id: string): void {
    this.loadingState.set(true);
    this.errorState.set('');

    forkJoin({
      count: this.api.get(id),
      lines: this.api.getLines(id, this.lineQueryState()),
    })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ count, lines }) => {
          this.countState.set(count);
          this.linesState.set(lines.data);
          this.linePaginationState.set(lines.pagination);
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  setLinePage(id: string, page: number): void {
    this.lineQueryState.update((query) => ({ ...query, page }));
    this.loadLines(id);
  }

  setLineFilter(id: string, search: string, varianceOnly: boolean): void {
    this.lineQueryState.update((query) => ({
      ...query,
      page: 1,
      search: search.trim() || undefined,
      varianceOnly: varianceOnly || undefined,
    }));
    this.loadLines(id);
  }

  saveLines(id: string, lines: readonly StockCountLineUpdate[]): void {
    if (this.savingState() || lines.length === 0) return;

    this.savingState.set(true);
    this.errorState.set('');

    this.api
      .saveLines(id, { lines }, this.lineQueryState())
      .pipe(finalize(() => this.savingState.set(false)))
      .subscribe({
        next: (response) => {
          this.linesState.set(response.data);
          this.linePaginationState.set(response.pagination);
          this.refreshHeader(id);
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  start(id: string): void {
    this.runAction(id, 'start', () => this.api.start(id));
  }

  submit(id: string): void {
    this.runAction(id, 'submit', () => this.api.submit(id));
  }

  approveAndPost(id: string): void {
    this.runAction(id, 'post', () => this.api.approveAndPost(id));
  }

  private runAction(
    id: string,
    action: 'start' | 'submit' | 'post',
    request: () => ReturnType<StockCountApiService['start']>,
  ): void {
    if (this.actionState()) return;

    this.actionState.set(action);
    this.errorState.set('');

    request()
      .pipe(finalize(() => this.actionState.set(null)))
      .subscribe({
        next: (count) => {
          this.countState.set(count);
          this.loadLines(id);
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  private refreshHeader(id: string): void {
    this.api.get(id).subscribe({
      next: (count) => this.countState.set(count),
      error: (error: unknown) => this.setError(error),
    });
  }

  private loadLines(id: string): void {
    this.loadingState.set(true);

    this.api
      .getLines(id, this.lineQueryState())
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => {
          this.linesState.set(response.data);
          this.linePaginationState.set(response.pagination);
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load stock count.',
    );
  }
}
