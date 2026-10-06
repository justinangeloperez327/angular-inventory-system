import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../../shared/ui/table/table';
import { StockMovementListStore } from '../data-access/stock-movement-list.store';
import { StockMovementType } from '../models/stock-movement.model';
import {
  quantityChangeLabel,
  safeReferencePath,
  stockMovementTypeLabel,
  stockMovementTypeVariant,
} from '../stock-movement-presenter';

@Component({
  selector: 'app-stock-movement-list-page',
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
  providers: [StockMovementListStore],
  templateUrl: './stock-movement-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockMovementListPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(StockMovementListStore);
  readonly filterError = signal('');
  readonly movementTypeLabel = stockMovementTypeLabel;
  readonly movementTypeVariant = stockMovementTypeVariant;
  readonly quantityLabel = quantityChangeLabel;
  readonly referencePath = safeReferencePath;

  readonly filters = this.formBuilder.nonNullable.group({
    search: [this.route.snapshot.queryParamMap.get('search') ?? ''],
    warehouseId: [this.route.snapshot.queryParamMap.get('warehouseId') ?? ''],
    type: [this.route.snapshot.queryParamMap.get('type') ?? ''],
    dateFrom: [this.route.snapshot.queryParamMap.get('dateFrom') ?? ''],
    dateTo: [this.route.snapshot.queryParamMap.get('dateTo') ?? ''],
    reference: [this.route.snapshot.queryParamMap.get('reference') ?? ''],
  });

  ngOnInit(): void {
    const value = this.filters.getRawValue();

    if (!this.validDateRange(value.dateFrom, value.dateTo)) {
      this.filterError.set('From date cannot be after To date.');
      this.filters.controls.dateFrom.setValue('');
      this.filters.controls.dateTo.setValue('');
    }

    const normalized = this.filters.getRawValue();

    this.store.initialize({
      search: normalized.search.trim() || undefined,
      warehouseId: normalized.warehouseId || undefined,
      type: this.toType(normalized.type),
      dateFrom: normalized.dateFrom || undefined,
      dateTo: normalized.dateTo || undefined,
      reference: normalized.reference.trim() || undefined,
    });
  }

  warehouseOptions(): readonly SelectOption[] {
    return (this.store.options()?.warehouses ?? []).map((warehouse) => ({
      label: `${warehouse.code} — ${warehouse.name}`,
      value: warehouse.id,
    }));
  }

  applyFilters(): void {
    const value = this.filters.getRawValue();

    if (!this.validDateRange(value.dateFrom, value.dateTo)) {
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
      type: '',
      dateFrom: '',
      dateTo: '',
      reference: '',
    });
    this.applyFilters();
  }

  private validDateRange(dateFrom: string, dateTo: string): boolean {
    return !dateFrom || !dateTo || dateFrom <= dateTo;
  }

  private toType(value: string): StockMovementType | undefined {
    const supported: readonly StockMovementType[] = [
      'receipt',
      'sale',
      'transfer-in',
      'transfer-out',
      'adjustment-in',
      'adjustment-out',
      'return-in',
      'return-out',
      'stock-count',
    ];

    return supported.includes(value as StockMovementType)
      ? (value as StockMovementType)
      : undefined;
  }
}
