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
import { CustomerApiService } from '../data-access/customer-api.service';
import { CustomerUpsertRequest } from '../models/customer.model';

type CustomerField =
  | 'code' | 'name' | 'contactName' | 'email' | 'phone' | 'taxNumber'
  | 'addressLine1' | 'addressLine2' | 'city' | 'stateProvince' | 'postalCode' | 'countryCode';

@Component({
  selector: 'app-customer-form-page',
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
  templateUrl: './customer-form-page.html',
  styleUrl: './customer-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerFormPage implements OnInit {
  private readonly api = inject(CustomerApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly loading = signal(this.editing);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly serverErrors = signal<Partial<Record<CustomerField, string>>>({});

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

    this.api.get(this.id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (item) => this.form.reset({
        code: item.code,
        name: item.name,
        contactName: item.contactName ?? '',
        email: item.email ?? '',
        phone: item.phone ?? '',
        taxNumber: item.taxNumber ?? '',
        addressLine1: item.addressLine1 ?? '',
        addressLine2: item.addressLine2 ?? '',
        city: item.city ?? '',
        stateProvince: item.stateProvince ?? '',
        postalCode: item.postalCode ?? '',
        countryCode: item.countryCode ?? '',
      }),
      error: (error: unknown) => this.setError(error, 'Unable to load customer.'),
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
    const request: CustomerUpsertRequest = {
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

    operation.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (item) => this.router.navigate(['/customers', item.id], { replaceUrl: !this.editing }),
      error: (error: unknown) => this.handleSaveError(error),
    });
  }

  fieldError(field: CustomerField): string {
    const serverError = this.serverErrors()[field];
    if (serverError) return serverError;

    const control = this.form.controls[field];
    if (!control.touched) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('pattern')) return 'Use a two-letter country code.';
    if (control.hasError('maxlength')) return 'Value is too long.';
    return '';
  }

  private handleSaveError(error: unknown): void {
    if (error instanceof ApiHttpError && error.validationErrors?.length) {
      const mapped: Partial<Record<CustomerField, string>> = {};

      for (const validationError of error.validationErrors) {
        if (validationError.field in this.form.controls && validationError.messages.length > 0) {
          mapped[validationError.field as CustomerField] = validationError.messages[0];
        }
      }

      this.serverErrors.set(mapped);
    }

    this.setError(error, 'Unable to save customer.');
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
