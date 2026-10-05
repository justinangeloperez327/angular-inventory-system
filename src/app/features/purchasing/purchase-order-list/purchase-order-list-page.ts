import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
import { PurchaseOrderListStore } from '../data-access/purchase-order-list.store';
import { PurchaseOrderStatus } from '../models/purchase-order.model';

@Component({
  selector: 'app-purchase-order-list-page',
  imports: [
    CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink, HasPermissionDirective,
    AlertComponent, BadgeComponent, ButtonComponent, ContentContainerComponent,
    EmptyStateComponent, InputComponent, PageHeaderComponent, PaginationComponent,
    SelectComponent, SkeletonComponent, TableComponent,
  ],
  providers: [PurchaseOrderListStore],
  templateUrl: './purchase-order-list-page.html',
  styleUrl: './purchase-order-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderListPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  readonly store = inject(PurchaseOrderListStore);
  readonly permissions = PERMISSIONS;
  readonly filterError = signal('');

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''], warehouseId: [''], status: [''], dateFrom: [''], dateTo: [''],
  });

  ngOnInit(): void { this.store.load(); }

  warehouseOptions(): readonly SelectOption[] {
    return (this.store.options()?.warehouses ?? []).map((item) => ({
      label: `${item.code} — ${item.name}`, value: item.id,
    }));
  }

  statusVariant(status: PurchaseOrderStatus): BadgeVariant {
    switch (status) {
      case 'approved':
      case 'partially-received': return 'info';
      case 'received': return 'success';
      case 'cancelled': return 'danger';
      case 'submitted': return 'warning';
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
