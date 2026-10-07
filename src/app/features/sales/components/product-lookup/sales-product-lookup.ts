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
  private readonly lookup = new SearchLookupState<SalesOrderProductOption>();

  @Input() warehouseId = '';
  @Output() readonly selected = new EventEmitter<SalesOrderProductOption>();

  readonly search = this.lookup.search;
  readonly results = this.lookup.results;
  readonly loading = this.lookup.loading;
  readonly error = this.lookup.error;

  find(): void {
    if (!this.warehouseId) {
      this.lookup.fail('Select a warehouse first.');
      return;
    }

    this.lookup.searchWith(
      (term) => this.api.searchProducts(this.warehouseId, term),
      { failureMessage: 'Unable to search products.' },
    );
  }

  choose(item: SalesOrderProductOption): void {
    this.selected.emit(item);
    this.lookup.reset();
  }
}
