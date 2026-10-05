import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
import { GoodsReceiptListStore } from '../data-access/goods-receipt-list.store';
import { GoodsReceiptStatus } from '../models/goods-receipt.model';

@Component({
  selector: 'app-goods-receipt-list-page',
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
  providers: [GoodsReceiptListStore],
  templateUrl: './goods-receipt-list-page.html',
  styleUrl: './goods-receipt-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoodsReceiptListPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(GoodsReceiptListStore);
  readonly filterError = signal('');
  readonly purchaseOrderId = this.route.snapshot.queryParamMap.get('purchaseOrderId') ?? '';

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    warehouseId: [''],
    status: [''],
    dateFrom: [''],
    dateTo: [''],
  });

  ngOnInit(): void {
    this.store.initialize({
      purchaseOrderId: this.purchaseOrderId || undefined,
    });
  }

  warehouseOptions(): readonly SelectOption[] {
    return (this.store.options()?.warehouses ?? []).map((item) => ({
      label: `${item.code} — ${item.name}`,
      value: item.id,
    }));
  }

  statusVariant(status: GoodsReceiptStatus): BadgeVariant {
    return status === 'posted' ? 'success' : status === 'cancelled' ? 'danger' : 'warning';
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
