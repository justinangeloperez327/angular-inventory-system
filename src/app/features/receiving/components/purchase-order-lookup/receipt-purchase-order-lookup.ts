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
import { GoodsReceiptApiService } from '../../data-access/goods-receipt-api.service';
import { GoodsReceiptPurchaseOrderOption } from '../../models/goods-receipt.model';

@Component({
  selector: 'app-receipt-purchase-order-lookup',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  templateUrl: './receipt-purchase-order-lookup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptPurchaseOrderLookupComponent {
  private readonly api = inject(GoodsReceiptApiService);

  @Input() selectedLabel = '';
  @Input() error = '';
  @Input() locked = false;
  @Output() readonly selected = new EventEmitter<GoodsReceiptPurchaseOrderOption>();
  @Output() readonly cleared = new EventEmitter<void>();

  readonly search = new FormControl('', { nonNullable: true });
  readonly results = signal<readonly GoodsReceiptPurchaseOrderOption[]>([]);
  readonly loading = signal(false);
  readonly searchError = signal('');

  find(): void {
    if (this.locked) return;

    const term = this.search.value.trim();

    if (term.length < 2) {
      this.searchError.set('Enter at least 2 characters.');
      this.results.set([]);
      return;
    }

    this.loading.set(true);
    this.searchError.set('');

    this.api
      .searchPurchaseOrders(term)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (results) => this.results.set(results),
        error: () => {
          this.results.set([]);
          this.searchError.set('Unable to search purchase orders.');
        },
      });
  }

  choose(item: GoodsReceiptPurchaseOrderOption): void {
    if (this.locked) return;

    this.selected.emit(item);
    this.results.set([]);
    this.search.setValue('');
    this.searchError.set('');
  }

  clear(): void {
    if (this.locked) return;

    this.cleared.emit();
    this.results.set([]);
    this.search.setValue('');
  }
}
