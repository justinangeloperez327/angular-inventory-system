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
import { InventoryAdjustmentListStore } from '../data-access/inventory-adjustment-list.store';
import {
  InventoryAdjustmentDirection,
  InventoryAdjustmentStatus,
} from '../models/inventory-adjustment.model';

@Component({
  selector: 'app-inventory-adjustment-list-page',
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
  providers: [InventoryAdjustmentListStore],
  templateUrl: './inventory-adjustment-list-page.html',
  styleUrl: './inventory-adjustment-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryAdjustmentListPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly store = inject(InventoryAdjustmentListStore);
  readonly permissions = PERMISSIONS;
  readonly filterError = signal('');

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    warehouseId: [''],
    direction: [''],
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

  statusVariant(status: InventoryAdjustmentStatus): BadgeVariant {
    return status === 'posted'
      ? 'success'
      : status === 'cancelled'
        ? 'danger'
        : 'warning';
  }

  directionVariant(direction: InventoryAdjustmentDirection): BadgeVariant {
    return direction === 'increase' ? 'success' : 'neutral';
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
      warehouseId: '',
      direction: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });
    this.applyFilters();
  }
}
