import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
import { ReportViewerStore } from '../data-access/report-viewer.store';
import { getReportDefinition } from '../report-definitions';
import { ReportColumnType, ReportFilter } from '../models/report.model';

@Component({
  selector: 'app-report-viewer-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
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
  providers: [ReportViewerStore],
  templateUrl: './report-viewer-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportViewerPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly document = inject(DOCUMENT);

  readonly store = inject(ReportViewerStore);
  readonly filterError = signal('');

  readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    warehouseId: [''],
    movementType: [''],
    dateFrom: [''],
    dateTo: [''],
  });

  ngOnInit(): void {
    const reportId = String(this.route.snapshot.data['reportId'] ?? '');
    const definition = getReportDefinition(reportId);

    if (!definition) {
      void this.router.navigate(['/reports'], { replaceUrl: true });
      return;
    }

    this.store.initialize(definition);
  }

  hasFilter(filter: ReportFilter): boolean {
    return this.store.definition()?.filters.includes(filter) ?? false;
  }

  warehouseOptions(): readonly SelectOption[] {
    return (this.store.options()?.warehouses ?? []).map((item) => ({
      label: `${item.code} — ${item.name}`,
      value: item.id,
    }));
  }

  movementTypeOptions(): readonly SelectOption[] {
    return (this.store.options()?.movementTypes ?? []).map((item) => ({
      label: item.label,
      value: item.value,
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
    this.filters.reset({
      search: '',
      warehouseId: '',
      movementType: '',
      dateFrom: '',
      dateTo: '',
    });
    this.applyFilters();
  }

  exportCsv(): void {
    const definition = this.store.definition();
    if (!definition) return;

    this.store.exportCsv((blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = this.document.createElement('a');
      anchor.href = url;
      anchor.download = `${definition.id}.csv`;
      anchor.style.display = 'none';
      this.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    });
  }

  isNumericType(type: ReportColumnType | undefined): boolean {
    return type === 'integer' || type === 'quantity' || type === 'currency';
  }

  isIdentifierColumn(key: string): boolean {
    return key === 'sku' || key.endsWith('Number') || key.endsWith('Code');
  }

  formatValue(
    value: string | number | boolean | null | undefined,
    type: ReportColumnType = 'text',
  ): string {
    if (value === null || value === undefined || value === '') return '—';

    switch (type) {
      case 'integer':
        return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(value));
      case 'quantity':
        return new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(Number(value));
      case 'currency': {
        const currencyCode = this.store.response()?.currencyCode;
        return currencyCode
          ? new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: currencyCode,
              maximumFractionDigits: 2,
            }).format(Number(value))
          : new Intl.NumberFormat(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(Number(value));
      }
      case 'date':
        return this.formatDate(String(value), false);
      case 'datetime':
        return this.formatDate(String(value), true);
      default:
        return String(value);
    }
  }

  private formatDate(value: string, includeTime: boolean): string {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(
      undefined,
      includeTime
        ? { dateStyle: 'medium', timeStyle: 'short' }
        : { dateStyle: 'medium' },
    ).format(date);
  }
}
