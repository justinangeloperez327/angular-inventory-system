import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SearchLookupState } from '../../../../shared/data-access/search-lookup.state';
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
  private readonly lookup = new SearchLookupState<InventoryTransferProductOption>();

  @Input() sourceWarehouseId = '';
  @Output() readonly selected = new EventEmitter<InventoryTransferProductOption>();

  readonly search = this.lookup.search;
  readonly results = this.lookup.results;
  readonly loading = this.lookup.loading;
  readonly error = this.lookup.error;

  find(): void {
    if (!this.sourceWarehouseId) {
      this.lookup.fail('Select a source warehouse first.');
      return;
    }

    this.lookup.searchWith(
      (term) => this.api.searchProducts(this.sourceWarehouseId, term),
      { failureMessage: 'Unable to search products.' },
    );
  }

  choose(product: InventoryTransferProductOption): void {
    this.selected.emit(product);
    this.lookup.reset();
  }
}
