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
import { PurchaseOrderApiService } from '../../data-access/purchase-order-api.service';
import { PurchaseOrderSupplierOption } from '../../models/purchase-order.model';

@Component({
  selector: 'app-purchase-supplier-lookup',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  templateUrl: './purchase-supplier-lookup.html',
  styleUrl: '../lookup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseSupplierLookupComponent {
  private readonly api = inject(PurchaseOrderApiService);

  @Input() selectedLabel = '';
  @Input() error = '';
  @Output() readonly selected = new EventEmitter<PurchaseOrderSupplierOption>();
  @Output() readonly cleared = new EventEmitter<void>();

  readonly search = new FormControl('', { nonNullable: true });
  readonly results = signal<readonly PurchaseOrderSupplierOption[]>([]);
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

    this.api.searchSuppliers(term).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (results) => this.results.set(results),
      error: () => {
        this.results.set([]);
        this.searchError.set('Unable to search suppliers.');
      },
    });
  }

  choose(item: PurchaseOrderSupplierOption): void {
    this.selected.emit(item);
    this.results.set([]);
    this.search.setValue('');
  }

  clear(): void {
    this.cleared.emit();
    this.results.set([]);
    this.search.setValue('');
  }
}
