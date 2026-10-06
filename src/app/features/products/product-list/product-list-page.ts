import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PERMISSIONS } from '../../../core/auth/permissions';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
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
import { ProductListStore } from '../data-access/product-list.store';

@Component({
  selector: 'app-product-list-page',
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
  providers: [ProductListStore],
  templateUrl: './product-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  readonly store = inject(ProductListStore);
  readonly permissions = PERMISSIONS;

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    categoryId: [''],
    unitId: [''],
    status: ['active'],
  });

  ngOnInit(): void {
    this.store.load();
  }

  categoryOptions(): readonly SelectOption[] {
    return (this.store.options()?.categories ?? []).map((category) => ({
      label: category.name,
      value: category.id,
    }));
  }

  unitOptions(): readonly SelectOption[] {
    return (this.store.options()?.units ?? []).map((unit) => ({
      label: unit.name,
      value: unit.id,
    }));
  }

  currencyCode(): string {
    return this.store.options()?.currencyCode ?? 'USD';
  }

  applyFilters(): void {
    this.store.applyFilters(this.filters.getRawValue());
  }

  clearFilters(): void {
    this.filters.reset({
      search: '',
      categoryId: '',
      unitId: '',
      status: 'active',
    });
    this.store.applyFilters(this.filters.getRawValue());
  }
}
