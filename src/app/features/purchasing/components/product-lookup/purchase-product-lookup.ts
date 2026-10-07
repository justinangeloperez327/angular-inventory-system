import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SearchLookupState } from '../../../../shared/data-access/search-lookup.state';
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
  private readonly lookup = new SearchLookupState<PurchaseOrderProductOption>();

  @Output() readonly selected = new EventEmitter<PurchaseOrderProductOption>();

  readonly search = this.lookup.search;
  readonly results = this.lookup.results;
  readonly loading = this.lookup.loading;
  readonly error = this.lookup.error;

  find(): void {
    this.lookup.searchWith(
      (term) => this.api.searchProducts(term),
      { failureMessage: 'Unable to search products.' },
    );
  }

  choose(item: PurchaseOrderProductOption): void {
    this.selected.emit(item);
    this.lookup.reset();
  }
}
