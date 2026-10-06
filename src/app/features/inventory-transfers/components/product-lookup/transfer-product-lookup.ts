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
import { InventoryTransferApiService } from '../../data-access/inventory-transfer-api.service';
import { InventoryTransferProductOption } from '../../models/inventory-transfer.model';

@Component({
  selector: 'app-transfer-product-lookup',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  templateUrl: './transfer-product-lookup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferProductLookupComponent {
  private readonly api = inject(InventoryTransferApiService);

  @Input() sourceWarehouseId = '';
  @Output() readonly selected = new EventEmitter<InventoryTransferProductOption>();

  readonly search = new FormControl('', { nonNullable: true });
  readonly results = signal<readonly InventoryTransferProductOption[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  find(): void {
    const term = this.search.value.trim();

    if (!this.sourceWarehouseId) {
      this.error.set('Select a source warehouse first.');
      this.results.set([]);
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
      .searchProducts(this.sourceWarehouseId, term)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (results) => this.results.set(results),
        error: () => {
          this.results.set([]);
          this.error.set('Unable to search products.');
        },
      });
  }

  choose(product: InventoryTransferProductOption): void {
    this.selected.emit(product);
    this.results.set([]);
    this.search.setValue('');
    this.error.set('');
  }
}
