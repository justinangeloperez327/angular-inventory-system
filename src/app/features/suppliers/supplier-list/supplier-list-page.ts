import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PERMISSIONS } from '../../../core/auth/permissions';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';
import { SelectComponent } from '../../../shared/ui/select/select';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../../shared/ui/table/table';
import { SupplierListStore } from '../data-access/supplier-list.store';
import { SupplierSummary } from '../models/supplier.model';

@Component({
  selector: 'app-supplier-list-page',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    HasPermissionDirective,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    ConfirmationDialogComponent,
    ContentContainerComponent,
    EmptyStateComponent,
    InputComponent,
    PageHeaderComponent,
    PaginationComponent,
    SelectComponent,
    SkeletonComponent,
    TableComponent,
  ],
  providers: [SupplierListStore],
  templateUrl: './supplier-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierListPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly store = inject(SupplierListStore);
  readonly permissions = PERMISSIONS;
  readonly selectedForDeactivation = signal<SupplierSummary | null>(null);

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    status: ['active'],
  });

  ngOnInit(): void {
    this.store.load();
  }

  applyFilters(): void {
    this.store.applyFilters(this.filters.getRawValue());
  }

  clearFilters(): void {
    this.filters.reset({
      search: '',
      status: '',
    });
    this.applyFilters();
  }

  deactivate(): void {
    const supplier = this.selectedForDeactivation();

    if (!supplier) {
      return;
    }

    this.selectedForDeactivation.set(null);
    this.store.setActive(supplier.id, false);
  }
}
