import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { SupplierApiService } from '../data-access/supplier-api.service';
import { SupplierUpsertRequest } from '../models/supplier.model';

type SupplierField =
  | 'code'
  | 'name'
  | 'contactName'
  | 'email'
  | 'phone'
  | 'taxNumber'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'stateProvince'
  | 'postalCode'
  | 'countryCode';

@Component({
  selector: 'app-supplier-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    ContentContainerComponent,
    InputComponent,
    PageHeaderComponent,
    SkeletonComponent,
  ],
  templateUrl: './supplier-form-page.html',
  styleUrl: './supplier-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierFormPage implements OnInit {
  private readonly api = inject(SupplierApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly loading = signal(this.editing);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly serverErrors = signal<Partial<Record<SupplierField, string>>>({});

  readonly form = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    contactName: ['', [Validators.maxLength(150)]],
    email: ['', [Validators.email, Validators.maxLength(200)]],
    phone: ['', [Validators.maxLength(50)]],
    taxNumber: ['', [Validators.maxLength(100)]],
    addressLine1: ['', [Validators.maxLength(250)]],
    addressLine2: ['', [Validators.maxLength(250)]],
    city: ['', [Validators.maxLength(100)]],
    stateProvince: ['', [Validators.maxLength(100)]],
    postalCode: ['', [Validators.maxLength(30)]],
    countryCode: ['', [Validators.pattern(/^[A-Za-z]{2}$/)]],
  });

  ngOnInit(): void {
    if (!this.id) {
      this.loading.set(false);
      return;
    }

    this.api
      .get(this.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (supplier) =>
          this.form.reset({
            code: supplier.code,
            name: supplier.name,
            contactName: supplier.contactName ?? '',
            email: supplier.email ?? '',
            phone: supplier.phone ?? '',
            taxNumber: supplier.taxNumber ?? '',
            addressLine1: supplier.addressLine1 ?? '',
            addressLine2: supplier.addressLine2 ?? '',
            city: supplier.city ?? '',
            stateProvince: supplier.stateProvince ?? '',
            postalCode: supplier.postalCode ?? '',
            countryCode: supplier.countryCode ?? '',
          }),
        error: (error: unknown) => this.setError(error, 'Unable to load supplier.'),
      });
  }

  submit(): void {
    this.error.set('');
    this.serverErrors.set({});

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: SupplierUpsertRequest = {
      code: value.code.trim(),
      name: value.name.trim(),
      contactName: value.contactName.trim() || undefined,
      email: value.email.trim() || undefined,
      phone: value.phone.trim() || undefined,
      taxNumber: value.taxNumber.trim() || undefined,
      addressLine1: value.addressLine1.trim() || undefined,
      addressLine2: value.addressLine2.trim() || undefined,
      city: value.city.trim() || undefined,
      stateProvince: value.stateProvince.trim() || undefined,
      postalCode: value.postalCode.trim() || undefined,
      countryCode: value.countryCode.trim().toUpperCase() || undefined,
    };

    this.saving.set(true);
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);

    operation
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (supplier) =>
          this.router.navigate(['/suppliers', supplier.id], { replaceUrl: !this.editing }),
        error: (error: unknown) => this.handleSaveError(error),
      });
  }

  fieldError(field: SupplierField): string {
    const serverError = this.serverErrors()[field];

    if (serverError) {
      return serverError;
    }

    const control = this.form.controls[field];

    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }

    if (control.hasError('pattern') && field === 'countryCode') {
      return 'Use a two-letter country code.';
    }

    if (control.hasError('maxlength')) {
      return 'Value is too long.';
    }

    return '';
  }

  private handleSaveError(error: unknown): void {
    if (error instanceof ApiHttpError && error.validationErrors?.length) {
      const mapped: Partial<Record<SupplierField, string>> = {};

      for (const validationError of error.validationErrors) {
        if (validationError.field in this.form.controls && validationError.messages.length > 0) {
          mapped[validationError.field as SupplierField] = validationError.messages[0];
        }
      }

      this.serverErrors.set(mapped);
    }

    this.setError(error, 'Unable to save supplier.');
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
