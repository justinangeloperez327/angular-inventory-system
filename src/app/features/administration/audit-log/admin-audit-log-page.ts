import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { AlertComponent } from '../../../shared/ui/alert/alert';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../../shared/ui/table/table';
import { AuditLogStore } from '../data-access/audit-log.store';

@Component({
  selector: 'app-admin-audit-log-page',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    AlertComponent,
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
  providers: [AuditLogStore],
  templateUrl: './admin-audit-log-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAuditLogPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly store = inject(AuditLogStore);
  readonly filterError = signal('');

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    area: [''],
    dateFrom: [''],
    dateTo: [''],
  });

  ngOnInit(): void {
    this.store.load();
  }

  areaOptions(): readonly SelectOption[] {
    return (this.store.options()?.areas ?? []).map((area) => ({
      label: area,
      value: area,
    }));
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
    this.filters.reset({ search: '', area: '', dateFrom: '', dateTo: '' });
    this.applyFilters();
  }
}
