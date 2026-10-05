import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
import { SalesOrderListStore } from '../data-access/sales-order-list.store';
import { SalesOrderStatus } from '../models/sales-order.model';

@Component({
  selector: 'app-sales-order-list-page',
  imports: [
    CurrencyPipe,
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
  providers: [SalesOrderListStore],
  templateUrl: './sales-order-list-page.html',
  styleUrl: './sales-order-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesOrderListPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(SalesOrderListStore);
  readonly permissions = PERMISSIONS;
  readonly filterError = signal('');
  readonly customerId = this.route.snapshot.queryParamMap.get('customerId') ?? '';

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    warehouseId: [''],
    status: [''],
    dateFrom: [''],
    dateTo: [''],
  });

  ngOnInit(): void {
    this.store.initialize(this.customerId || undefined);
  }

  warehouseOptions(): readonly SelectOption[] {
    return (this.store.options()?.warehouses ?? []).map((item) => ({
      label: `${item.code} — ${item.name}`,
      value: item.id,
    }));
  }

  statusVariant(status: SalesOrderStatus): BadgeVariant {
    switch (status) {
      case 'completed': return 'success';
      case 'dispatched': return 'info';
      case 'confirmed': return 'warning';
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
