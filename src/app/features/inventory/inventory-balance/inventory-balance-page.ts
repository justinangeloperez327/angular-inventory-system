import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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
import { InventoryBalanceStore } from '../data-access/inventory-balance.store';
import { InventoryStockStatus } from '../models/inventory.model';

@Component({
  selector: 'app-inventory-balance-page',
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
  providers: [InventoryBalanceStore],
  templateUrl: './inventory-balance-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryBalancePage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  readonly store = inject(InventoryBalanceStore);

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    warehouseId: [''],
    status: [''],
  });

  ngOnInit(): void {
    this.store.load();
  }

  warehouseOptions(): readonly SelectOption[] {
    return (this.store.options()?.warehouses ?? []).map((warehouse) => ({
      label: `${warehouse.code} — ${warehouse.name}`,
      value: warehouse.id,
    }));
  }

  statusVariant(status: InventoryStockStatus): BadgeVariant {
    switch (status) {
      case 'out-of-stock':
        return 'danger';
      case 'low-stock':
        return 'warning';
      default:
        return 'success';
    }
  }

  statusLabel(status: InventoryStockStatus): string {
    switch (status) {
      case 'out-of-stock':
        return 'Out of stock';
      case 'low-stock':
        return 'Low stock';
      default:
        return 'In stock';
    }
  }

  applyFilters(): void {
    this.store.applyFilters(this.filters.getRawValue());
  }

  clearFilters(): void {
    this.filters.reset({
      search: '',
      warehouseId: '',
      status: '',
    });
    this.applyFilters();
  }
}
