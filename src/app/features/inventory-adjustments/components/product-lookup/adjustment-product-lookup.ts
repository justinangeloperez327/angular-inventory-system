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
import { InventoryAdjustmentApiService } from '../../data-access/inventory-adjustment-api.service';
import { InventoryAdjustmentProductOption } from '../../models/inventory-adjustment.model';

@Component({
  selector: 'app-adjustment-product-lookup',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  templateUrl: './adjustment-product-lookup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdjustmentProductLookupComponent {
  private readonly api = inject(InventoryAdjustmentApiService);

  @Input() selectedLabel = '';
  @Input() error = '';
  @Output() readonly selected = new EventEmitter<InventoryAdjustmentProductOption>();
  @Output() readonly cleared = new EventEmitter<void>();

  readonly search = new FormControl('', { nonNullable: true });
  readonly results = signal<readonly InventoryAdjustmentProductOption[]>([]);
  readonly loading = signal(false);
  readonly searchError = signal('');

  find(): void {
    const term = this.search.value.trim();

    if (term.length < 2) {
      this.searchError.set('Enter at least 2 characters.');
      this.results.set([]);
      return;
    }

    this.loading.set(true);
    this.searchError.set('');

    this.api
      .searchProducts(term)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (results) => this.results.set(results),
        error: () => {
          this.results.set([]);
          this.searchError.set('Unable to search products.');
        },
      });
  }

  choose(product: InventoryAdjustmentProductOption): void {
    this.selected.emit(product);
    this.results.set([]);
    this.search.setValue('');
    this.searchError.set('');
  }

  clear(): void {
    this.cleared.emit();
    this.results.set([]);
    this.search.setValue('');
  }
}
