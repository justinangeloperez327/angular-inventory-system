import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { InputComponent } from '../../../../shared/ui/input/input';
import { SalesOrderApiService } from '../../data-access/sales-order-api.service';
import { SalesOrderProductOption } from '../../models/sales-order.model';

@Component({
  selector: 'app-sales-product-lookup',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  templateUrl: './sales-product-lookup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesProductLookupComponent {
  private readonly api = inject(SalesOrderApiService);

  @Input() warehouseId = '';
  @Output() readonly selected = new EventEmitter<SalesOrderProductOption>();

  readonly search = new FormControl('', { nonNullable: true });
  readonly results = signal<readonly SalesOrderProductOption[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  find(): void {
    const term = this.search.value.trim();

    if (!this.warehouseId) {
      this.error.set('Select a warehouse first.');
      return;
    }

    if (term.length < 2) {
      this.error.set('Enter at least 2 characters.');
      this.results.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.api
      .searchProducts(this.warehouseId, term)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (results) => this.results.set(results),
        error: () => {
          this.results.set([]);
          this.error.set('Unable to search products.');
        },
      });
  }

  choose(item: SalesOrderProductOption): void {
    this.selected.emit(item);
    this.results.set([]);
    this.search.setValue('');
    this.error.set('');
  }
}
