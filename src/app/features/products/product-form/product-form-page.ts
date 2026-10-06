import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea';
import { ProductApiService } from '../data-access/product-api.service';
import { ProductDetail, ProductFormOptions, ProductUpsertRequest } from '../models/product.model';

type ProductField =
  | 'sku'
  | 'barcode'
  | 'name'
  | 'description'
  | 'categoryId'
  | 'unitId'
  | 'costPrice'
  | 'sellingPrice'
  | 'reorderLevel';

@Component({
  selector: 'app-product-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    ContentContainerComponent,
    InputComponent,
    PageHeaderComponent,
    SelectComponent,
    SkeletonComponent,
    TextareaComponent,
  ],
  templateUrl: './product-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPage implements OnInit {
  private readonly api = inject(ProductApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal('');
  readonly formError = signal('');
  readonly serverErrors = signal<Partial<Record<ProductField, string>>>({});
  readonly options = signal<ProductFormOptions | null>(null);

  readonly productId = this.route.snapshot.paramMap.get('id');
  readonly editing = this.productId !== null;

  readonly form = this.formBuilder.nonNullable.group({
    sku: ['', [Validators.required, Validators.maxLength(100)]],
    barcode: ['', [Validators.maxLength(100)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    categoryId: [''],
    unitId: [''],
    costPrice: ['0', [Validators.required, Validators.min(0)]],
    sellingPrice: ['0', [Validators.required, Validators.min(0)]],
    reorderLevel: ['0', [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    const productRequest = this.productId ? this.api.get(this.productId) : of(null);

    forkJoin({
      options: this.api.getFormOptions(),
      product: productRequest,
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ options, product }) => {
          this.options.set(options);
          if (product) {
            this.populate(product);
          }
        },
        error: (error: unknown) => {
          this.loadError.set(
            error instanceof ApiHttpError ? error.message : 'Unable to load product form.',
          );
        },
      });
  }

  categoryOptions(): readonly SelectOption[] {
    return (this.options()?.categories ?? []).map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }

  unitOptions(): readonly SelectOption[] {
    return (this.options()?.units ?? []).map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }

  submit(): void {
    this.formError.set('');
    this.serverErrors.set({});

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.toRequest();
    this.saving.set(true);

    const operation = this.productId
      ? this.api.update(this.productId, request)
      : this.api.create(request);

    operation
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (product) =>
          this.router.navigate(['/products', product.id], { replaceUrl: !this.editing }),
        error: (error: unknown) => this.handleSaveError(error),
      });
  }

  fieldError(field: ProductField): string {
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

    if (control.hasError('min')) {
      return 'Value must be zero or greater.';
    }

    if (control.hasError('maxlength')) {
      return 'Value is too long.';
    }

    return '';
  }

  private populate(product: ProductDetail): void {
    this.form.reset({
      sku: product.sku,
      barcode: product.barcode ?? '',
      name: product.name,
      description: product.description ?? '',
      categoryId: product.categoryId ?? '',
      unitId: product.unitId ?? '',
      costPrice: String(product.costPrice),
      sellingPrice: String(product.sellingPrice),
      reorderLevel: String(product.reorderLevel),
    });
  }

  private toRequest(): ProductUpsertRequest {
    const value = this.form.getRawValue();

    return {
      sku: value.sku.trim(),
      barcode: value.barcode.trim() || undefined,
      name: value.name.trim(),
      description: value.description.trim() || undefined,
      categoryId: value.categoryId || undefined,
      unitId: value.unitId || undefined,
      costPrice: Number(value.costPrice),
      sellingPrice: Number(value.sellingPrice),
      reorderLevel: Number(value.reorderLevel),
    };
  }

  private handleSaveError(error: unknown): void {
    if (!(error instanceof ApiHttpError)) {
      this.formError.set('Unable to save product.');
      return;
    }

    if (error.validationErrors?.length) {
      const fieldErrors: Partial<Record<ProductField, string>> = {};

      for (const validationError of error.validationErrors) {
        if (this.isProductField(validationError.field) && validationError.messages.length > 0) {
          fieldErrors[validationError.field] = validationError.messages[0];
        }
      }

      this.serverErrors.set(fieldErrors);
    }

    this.formError.set(error.message);
  }

  private isProductField(field: string): field is ProductField {
    return field in this.form.controls;
  }
}
