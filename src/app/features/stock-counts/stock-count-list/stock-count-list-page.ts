import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../../shared/ui/table/table';
import { StockCountListStore } from '../data-access/stock-count-list.store';
import { StockCountStatus } from '../models/stock-count.model';

@Component({
  selector: 'app-stock-count-list-page',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    ContentContainerComponent,
    EmptyStateComponent,
    InputComponent,
    PageHeaderComponent,
    PaginationComponent,
    SelectComponent,
    SkeletonComponent,
    TableComponent,
  ],
  providers: [StockCountListStore],
  templateUrl: './stock-count-list-page.html',
  styleUrl: './stock-count-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockCountListPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly store = inject(StockCountListStore);
  readonly filterError = signal('');

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    warehouseId: [''],
    status: [''],
    dateFrom: [''],
    dateTo: [''],
  });

  ngOnInit(): void {
    this.store.load();
  }

  warehouseOptions(): readonly SelectOption[] {
    return (this.store.options()?.warehouses ?? []).map((item) => ({
      label: `${item.code} — ${item.name}`,
      value: item.id,
    }));
  }

  statusVariant(status: StockCountStatus): BadgeVariant {
    switch (status) {
      case 'posted': return 'success';
      case 'submitted': return 'info';
      case 'counting': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'neutral';
    }
  }

  applyFilters(): void {
    const value = this.filters.getRawValue();

    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      this.filterError.set('From date cannot be after To date.');
      return;
    }

    this.filterError.set('');
    this.store.applyFilters(value);
  }

  clearFilters(): void {
    this.filterError.set('');
    this.filters.reset({ search: '', warehouseId: '', status: '', dateFrom: '', dateTo: '' });
    this.applyFilters();
  }
}
