import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../../shared/ui/table/table';
import { AdminUserListStore } from '../data-access/admin-user-list.store';
import { AdminUserSummary } from '../models/admin-user.model';

@Component({
  selector: 'app-admin-user-list-page',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
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
  providers: [AdminUserListStore],
  templateUrl: './admin-user-list-page.html',
  styleUrl: './admin-user-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserListPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly store = inject(AdminUserListStore);
  readonly pendingStatusUser = signal<AdminUserSummary | null>(null);

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    roleId: [''],
    status: ['active'],
  });

  ngOnInit(): void {
    this.store.load();
  }

  roleOptions(): readonly SelectOption[] {
    return (this.store.options()?.roles ?? []).map((role) => ({
      label: role.name,
      value: role.id,
    }));
  }

  applyFilters(): void {
    this.store.applyFilters(this.filters.getRawValue());
  }

  clearFilters(): void {
    this.filters.reset({ search: '', roleId: '', status: '' });
    this.applyFilters();
  }

  confirmStatusChange(): void {
    const user = this.pendingStatusUser();
    this.pendingStatusUser.set(null);

    if (user) {
      this.store.setActive(user.id, !user.active);
    }
  }
}
