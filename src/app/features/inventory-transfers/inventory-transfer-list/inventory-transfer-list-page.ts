import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PERMISSIONS } from '../../../core/auth/permissions';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
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
import { InventoryTransferListStore } from '../data-access/inventory-transfer-list.store';
import { InventoryTransferStatus } from '../models/inventory-transfer.model';

@Component({
  selector: 'app-inventory-transfer-list-page',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    HasPermissionDirective,
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
  providers: [InventoryTransferListStore],
  templateUrl: './inventory-transfer-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryTransferListPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly store = inject(InventoryTransferListStore);
  readonly permissions = PERMISSIONS;
  readonly filterError = signal('');

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    sourceWarehouseId: [''],
    destinationWarehouseId: [''],
    status: [''],
    dateFrom: [''],
    dateTo: [''],
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

  statusVariant(status: InventoryTransferStatus): BadgeVariant {
    return status === 'posted'
      ? 'success'
      : status === 'cancelled'
        ? 'danger'
        : 'warning';
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
    this.filters.reset({
      search: '',
      sourceWarehouseId: '',
      destinationWarehouseId: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });
    this.applyFilters();
  }
}
