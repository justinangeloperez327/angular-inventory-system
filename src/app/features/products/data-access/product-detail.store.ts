import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { ProductApiService } from './product-api.service';
import { ProductDetail } from '../models/product.model';

@Injectable()
export class ProductDetailStore {
  private readonly api = inject(ProductApiService);

  private readonly productState = signal<ProductDetail | null>(null);
  private readonly loadingState = signal(false);
  private readonly updatingStatusState = signal(false);
  private readonly errorState = signal('');

  readonly product = this.productState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly updatingStatus = this.updatingStatusState.asReadonly();
  readonly error = this.errorState.asReadonly();

  load(id: string): void {
    this.loadingState.set(true);
    this.errorState.set('');

    this.api
      .get(id)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (product) => this.productState.set(product),
        error: (error: unknown) => this.setError(error),
      });
  }

  setActive(id: string, active: boolean): void {
    if (this.updatingStatusState()) {
      return;
    }

    this.updatingStatusState.set(true);
    this.errorState.set('');

    this.api
      .setActive(id, active)
      .pipe(finalize(() => this.updatingStatusState.set(false)))
      .subscribe({
        next: (product) => this.productState.set(product),
        error: (error: unknown) => this.setError(error),
      });
  }

  private setError(error: unknown): void {
    this.errorState.set(
      error instanceof ApiHttpError ? error.message : 'Unable to load product.',
    );
  }
}
