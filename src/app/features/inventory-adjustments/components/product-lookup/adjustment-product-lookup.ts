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
  private readonly lookup = new SearchLookupState<InventoryAdjustmentProductOption>();

  @Input() selectedLabel = '';
  @Input() error = '';
  @Output() readonly selected = new EventEmitter<InventoryAdjustmentProductOption>();
  @Output() readonly cleared = new EventEmitter<void>();

  readonly search = this.lookup.search;
  readonly results = this.lookup.results;
  readonly loading = this.lookup.loading;
  readonly searchError = this.lookup.error;

  find(): void {
    this.lookup.searchWith(
      (term) => this.api.searchProducts(term),
      { failureMessage: 'Unable to search products.' },
    );
  }

  choose(product: InventoryAdjustmentProductOption): void {
    this.selected.emit(product);
    this.lookup.reset();
  }

  clear(): void {
    this.cleared.emit();
    this.lookup.reset();
  }
}
