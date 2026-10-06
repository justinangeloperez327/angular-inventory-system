import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { AdjustmentProductLookupComponent } from '../components/product-lookup/adjustment-product-lookup';
import { InventoryAdjustmentApiService } from '../data-access/inventory-adjustment-api.service';
import {
  InventoryAdjustmentDetail,
  InventoryAdjustmentDirection,
  InventoryAdjustmentFormOptions,
  InventoryAdjustmentProductOption,
  InventoryAdjustmentUpsertRequest,
} from '../models/inventory-adjustment.model';

type AdjustmentField =
  | 'productId'
  | 'warehouseId'
  | 'direction'
  | 'quantity'
  | 'reasonCode'
  | 'notes';

@Component({
  selector: 'app-inventory-adjustment-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    AdjustmentProductLookupComponent,
    ButtonComponent,
    ContentContainerComponent,
    InputComponent,
    PageHeaderComponent,
    SelectComponent,
    SkeletonComponent,
    TextareaComponent,
  ],
  templateUrl: './inventory-adjustment-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryAdjustmentFormPage implements OnInit {
  private readonly api = inject(InventoryAdjustmentApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly options = signal<InventoryAdjustmentFormOptions | null>(null);
  readonly selectedProductLabel = signal('');
  readonly serverErrors = signal<Partial<Record<AdjustmentField, string>>>({});

  readonly form = this.formBuilder.nonNullable.group({
    productId: ['', [Validators.required]],
    warehouseId: ['', [Validators.required]],
    direction: ['increase' as InventoryAdjustmentDirection, [Validators.required]],
    quantity: ['', [Validators.required, Validators.min(0.000001)]],
    reasonCode: ['', [Validators.required]],
    notes: ['', [Validators.maxLength(1000)]],
  });

  constructor() {
    this.form.controls.direction.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.directionChanged());
  }

  ngOnInit(): void {
    const itemRequest = this.id ? this.api.get(this.id) : of(null);

    forkJoin({
      options: this.api.getFormOptions(),
      item: itemRequest,
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ options, item }) => {
          this.options.set(options);

          if (item) {
            if (item.status !== 'draft') {
              void this.router.navigate(['/adjustments', item.id], { replaceUrl: true });
              return;
            }

            this.populate(item);
          }
        },
        error: (error: unknown) => this.setError(error, 'Unable to load adjustment form.'),
      });
  }

  warehouseOptions(): readonly SelectOption[] {
    return (this.options()?.warehouses ?? []).map((warehouse) => ({
      label: `${warehouse.code} — ${warehouse.name}`,
      value: warehouse.id,
    }));
  }

  reasonOptions(): readonly SelectOption[] {
    const direction = this.form.controls.direction.value;

    return (this.options()?.reasons ?? [])
      .filter((reason) => !reason.direction || reason.direction === direction)
      .map((reason) => ({ label: reason.label, value: reason.code }));
  }

  selectProduct(product: InventoryAdjustmentProductOption): void {
    this.form.controls.productId.setValue(product.id);
    this.form.controls.productId.markAsTouched();
    this.selectedProductLabel.set(`${product.sku} — ${product.name}`);
  }

  clearProduct(): void {
    this.form.controls.productId.setValue('');
    this.form.controls.productId.markAsTouched();
    this.selectedProductLabel.set('');
  }

  submit(): void {
    this.error.set('');
    this.serverErrors.set({});

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: InventoryAdjustmentUpsertRequest = {
      productId: value.productId,
      warehouseId: value.warehouseId,
      direction: value.direction,
      quantity: Number(value.quantity),
      reasonCode: value.reasonCode,
      notes: value.notes.trim() || undefined,
    };

    this.saving.set(true);
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);

    operation
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (item) =>
          this.router.navigate(['/adjustments', item.id], { replaceUrl: !this.editing }),
        error: (error: unknown) => this.handleSaveError(error),
      });
  }

  fieldError(field: AdjustmentField): string {
    const serverError = this.serverErrors()[field];
    if (serverError) return serverError;

    const control = this.form.controls[field];
    if (!control.touched) return '';

    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('min')) return 'Quantity must be greater than zero.';
    if (control.hasError('maxlength')) return 'Value is too long.';
    return '';
  }

  private directionChanged(): void {
    const reasonCode = this.form.controls.reasonCode.value;

    if (!reasonCode) {
      return;
    }

    const validReason = this.reasonOptions().some((option) => option.value === reasonCode);

    if (!validReason) {
      this.form.controls.reasonCode.setValue('');
      this.form.controls.reasonCode.markAsTouched();
    }
  }

  private populate(item: InventoryAdjustmentDetail): void {
    this.form.reset({
      productId: item.productId,
      warehouseId: item.warehouseId,
      direction: item.direction,
      quantity: String(item.quantity),
      reasonCode: item.reasonCode,
      notes: item.notes ?? '',
    });
    this.selectedProductLabel.set(`${item.sku} — ${item.productName}`);
  }

  private handleSaveError(error: unknown): void {
    if (error instanceof ApiHttpError && error.validationErrors?.length) {
      const mapped: Partial<Record<AdjustmentField, string>> = {};

      for (const validationError of error.validationErrors) {
        if (validationError.field in this.form.controls && validationError.messages.length > 0) {
          mapped[validationError.field as AdjustmentField] = validationError.messages[0];
        }
      }

      this.serverErrors.set(mapped);
    }

    this.setError(error, 'Unable to save adjustment.');
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
