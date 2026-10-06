import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { AdminSettingsApiService } from '../data-access/admin-settings-api.service';
import {
  ApplicationSettings,
  ApplicationSettingsOptions,
  ApplicationSettingsUpdateRequest,
  StockCountConcurrencyPolicy,
} from '../models/admin-settings.model';

@Component({
  selector: 'app-admin-settings-page',
  imports: [
    ReactiveFormsModule,
    AlertComponent,
    ButtonComponent,
    ContentContainerComponent,
    InputComponent,
    PageHeaderComponent,
    SelectComponent,
    SkeletonComponent,
  ],
  templateUrl: './admin-settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsPage implements OnInit {
  private readonly api = inject(AdminSettingsApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly saved = signal(false);
  readonly settings = signal<ApplicationSettings | null>(null);
  readonly options = signal<ApplicationSettingsOptions | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    organizationName: ['', [Validators.required, Validators.maxLength(200)]],
    timezone: ['', [Validators.required]],
    currencyCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]],
    defaultPageSize: ['25', [Validators.required, Validators.min(10), Validators.max(100)]],
    allowNegativeStock: [false],
    stockCountConcurrencyPolicy: ['freeze' as StockCountConcurrencyPolicy, [Validators.required]],
  });

  ngOnInit(): void {
    forkJoin({
      settings: this.api.get(),
      options: this.api.getOptions(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ settings, options }) => {
          this.settings.set(settings);
          this.options.set(options);
          this.populate(settings);
        },
        error: (error: unknown) => this.setError(error, 'Unable to load application settings.'),
      });
  }

  timezoneOptions(): readonly SelectOption[] {
    return (this.options()?.timezones ?? []).map((timezone) => ({
      label: timezone,
      value: timezone,
    }));
  }

  currencyOptions(): readonly SelectOption[] {
    return (this.options()?.currencies ?? []).map((currency) => ({
      label: currency,
      value: currency,
    }));
  }

  submit(): void {
    this.error.set('');
    this.saved.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: ApplicationSettingsUpdateRequest = {
      organizationName: value.organizationName.trim(),
      timezone: value.timezone,
      currencyCode: value.currencyCode,
      defaultPageSize: Number(value.defaultPageSize),
      allowNegativeStock: value.allowNegativeStock,
      stockCountConcurrencyPolicy: value.stockCountConcurrencyPolicy,
    };

    this.saving.set(true);

    this.api
      .update(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (settings) => {
          this.settings.set(settings);
          this.populate(settings);
          this.saved.set(true);
        },
        error: (error: unknown) => this.setError(error, 'Unable to save application settings.'),
      });
  }

  fieldError(field: 'organizationName' | 'timezone' | 'currencyCode' | 'defaultPageSize' | 'stockCountConcurrencyPolicy'): string {
    const control = this.form.controls[field];
    if (!control.touched) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('pattern')) return 'Use a valid three-letter currency code.';
    if (control.hasError('min') || control.hasError('max')) return 'Use a value between 10 and 100.';
    if (control.hasError('maxlength')) return 'Value is too long.';
    return '';
  }

  private populate(settings: ApplicationSettings): void {
    this.form.reset({
      organizationName: settings.organizationName,
      timezone: settings.timezone,
      currencyCode: settings.currencyCode,
      defaultPageSize: String(settings.defaultPageSize),
      allowNegativeStock: settings.allowNegativeStock,
      stockCountConcurrencyPolicy: settings.stockCountConcurrencyPolicy,
    });
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
