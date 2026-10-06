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
import { SalesOrderCustomerOption } from '../../models/sales-order.model';

@Component({
  selector: 'app-sales-customer-lookup',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  templateUrl: './sales-customer-lookup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesCustomerLookupComponent {
  private readonly api = inject(SalesOrderApiService);

  @Input() selectedLabel = '';
  @Input() error = '';
  @Output() readonly selected = new EventEmitter<SalesOrderCustomerOption>();
  @Output() readonly cleared = new EventEmitter<void>();

  readonly search = new FormControl('', { nonNullable: true });
  readonly results = signal<readonly SalesOrderCustomerOption[]>([]);
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

    this.api.searchCustomers(term).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (results) => this.results.set(results),
      error: () => {
        this.results.set([]);
        this.searchError.set('Unable to search customers.');
      },
    });
  }

  choose(item: SalesOrderCustomerOption): void {
    this.selected.emit(item);
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
