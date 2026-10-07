import { signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { finalize, Observable } from 'rxjs';

export interface SearchLookupOptions {
  readonly minimumLength?: number;
  readonly minimumLengthMessage?: string;
  readonly failureMessage?: string;
}

export class SearchLookupState<T> {
  readonly search = new FormControl('', { nonNullable: true });

  private readonly resultsState = signal<readonly T[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');

  readonly results = this.resultsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  searchWith(
    searcher: (term: string) => Observable<readonly T[]>,
    options: SearchLookupOptions = {},
  ): void {
    const term = this.search.value.trim();
    const minimumLength = options.minimumLength ?? 2;

    if (term.length < minimumLength) {
      this.fail(
        options.minimumLengthMessage ??
          `Enter at least ${minimumLength} characters.`,
      );
      return;
    }

    this.loadingState.set(true);
    this.errorState.set('');

    searcher(term)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (results) => this.resultsState.set(results),
        error: () => {
          this.resultsState.set([]);
          this.errorState.set(options.failureMessage ?? 'Unable to search.');
        },
      });
  }

  fail(message: string): void {
    this.errorState.set(message);
    this.resultsState.set([]);
  }

  reset(): void {
    this.search.setValue('');
    this.resultsState.set([]);
    this.errorState.set('');
  }
}
