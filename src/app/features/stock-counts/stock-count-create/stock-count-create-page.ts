import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea';
import { StockCountApiService } from '../data-access/stock-count-api.service';
import { StockCountFormOptions } from '../models/stock-count.model';

@Component({
  selector: 'app-stock-count-create-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    ContentContainerComponent,
    PageHeaderComponent,
    SelectComponent,
    SkeletonComponent,
    TextareaComponent,
  ],
  templateUrl: './stock-count-create-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockCountCreatePage implements OnInit {
  private readonly api = inject(StockCountApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly options = signal<StockCountFormOptions | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    warehouseId: ['', [Validators.required]],
    notes: ['', [Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    this.api.getFormOptions().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (options) => this.options.set(options),
      error: (error: unknown) => this.setError(error, 'Unable to load stock count form.'),
    });
  }

  warehouseOptions(): readonly SelectOption[] {
    return (this.options()?.warehouses ?? []).map((item) => ({
      label: `${item.code} — ${item.name}`,
      value: item.id,
    }));
  }

  submit(): void {
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);

    this.api
      .create({
        warehouseId: value.warehouseId,
        notes: value.notes.trim() || undefined,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (count) => this.router.navigate(['/stock-counts', count.id], { replaceUrl: true }),
        error: (error: unknown) => this.setError(error, 'Unable to create stock count.'),
      });
  }

  fieldError(field: 'warehouseId' | 'notes'): string {
    const control = this.form.controls[field];
    if (!control.touched) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('maxlength')) return 'Value is too long.';
    return '';
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
