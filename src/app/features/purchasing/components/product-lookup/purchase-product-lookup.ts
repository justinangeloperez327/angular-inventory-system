import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { InputComponent } from '../../../../shared/ui/input/input';
import { PurchaseOrderApiService } from '../../data-access/purchase-order-api.service';
import { PurchaseOrderProductOption } from '../../models/purchase-order.model';

@Component({
  selector: 'app-purchase-product-lookup',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  templateUrl: './purchase-product-lookup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseProductLookupComponent {
  private readonly api = inject(PurchaseOrderApiService);

  @Output() readonly selected = new EventEmitter<PurchaseOrderProductOption>();

  readonly search = new FormControl('', { nonNullable: true });
  readonly results = signal<readonly PurchaseOrderProductOption[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  find(): void {
    const term = this.search.value.trim();
    if (term.length < 2) {
      this.error.set('Enter at least 2 characters.');
      this.results.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.api.searchProducts(term).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (results) => this.results.set(results),
      error: () => {
        this.results.set([]);
        this.error.set('Unable to search products.');
      },
    });
  }

  choose(item: PurchaseOrderProductOption): void {
    this.selected.emit(item);
    this.results.set([]);
    this.search.setValue('');
    this.error.set('');
  }
}
