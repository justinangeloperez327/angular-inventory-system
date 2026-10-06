import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { PurchaseProductLookupComponent } from '../components/product-lookup/purchase-product-lookup';
import { PurchaseSupplierLookupComponent } from '../components/supplier-lookup/purchase-supplier-lookup';
import { PurchaseOrderApiService } from '../data-access/purchase-order-api.service';
import {
  PurchaseOrderDetail,
  PurchaseOrderFormOptions,
  PurchaseOrderProductOption,
  PurchaseOrderSupplierOption,
  PurchaseOrderUpsertRequest,
} from '../models/purchase-order.model';

type PurchaseLineForm = FormGroup<{
  productId: FormControl<string>;
  sku: FormControl<string>;
  productName: FormControl<string>;
  unitSymbol: FormControl<string>;
  quantity: FormControl<string>;
  unitPrice: FormControl<string>;
}>;

function localDateValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-purchase-order-form-page',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    ContentContainerComponent,
    InputComponent,
    PageHeaderComponent,
    PurchaseProductLookupComponent,
    PurchaseSupplierLookupComponent,
    SelectComponent,
    SkeletonComponent,
    TextareaComponent,
  ],
  templateUrl: './purchase-order-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderFormPage implements OnInit {
  private readonly api = inject(PurchaseOrderApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly lineError = signal('');
  readonly options = signal<PurchaseOrderFormOptions | null>(null);
  readonly selectedSupplierLabel = signal('');

  readonly lines = new FormArray<PurchaseLineForm>([], [Validators.minLength(1)]);

  readonly form = this.formBuilder.nonNullable.group({
    supplierId: ['', [Validators.required]],
    warehouseId: ['', [Validators.required]],
    orderDate: [localDateValue(), [Validators.required]],
    expectedDate: [''],
    notes: ['', [Validators.maxLength(1000)]],
    lines: this.lines,
  });

  ngOnInit(): void {
    const itemRequest = this.id ? this.api.get(this.id) : of(null);

    forkJoin({ options: this.api.getFormOptions(), item: itemRequest })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ options, item }) => {
          this.options.set(options);

          if (item) {
            if (item.status !== 'draft') {
              void this.router.navigate(['/purchasing', item.id], { replaceUrl: true });
              return;
            }

            this.populate(item);
          }
        },
        error: (error: unknown) =>
          this.setError(error, 'Unable to load purchase order form.'),
      });
  }

  warehouseOptions(): readonly SelectOption[] {
    return (this.options()?.warehouses ?? []).map((item) => ({
      label: `${item.code} — ${item.name}`,
      value: item.id,
    }));
  }

  selectSupplier(item: PurchaseOrderSupplierOption): void {
    this.form.controls.supplierId.setValue(item.id);
    this.form.controls.supplierId.markAsTouched();
    this.selectedSupplierLabel.set(`${item.code} — ${item.name}`);
  }

  clearSupplier(): void {
    this.form.controls.supplierId.setValue('');
    this.form.controls.supplierId.markAsTouched();
    this.selectedSupplierLabel.set('');
  }

  addProduct(item: PurchaseOrderProductOption): void {
    if (this.lines.controls.some((line) => line.controls.productId.value === item.id)) {
      this.lineError.set('This product is already included in the purchase order.');
      return;
    }

    this.lineError.set('');
    this.lines.push(
      this.createLine(
        item.id,
        item.sku,
        item.name,
        item.unitSymbol ?? '',
        '',
        String(item.defaultUnitPrice ?? ''),
      ),
    );
  }

  removeLine(index: number): void {
    this.lines.removeAt(index);
  }

  lineTotal(index: number): number {
    const line = this.lines.at(index).getRawValue();
    return Number(line.quantity || 0) * Number(line.unitPrice || 0);
  }

  subtotal(): number {
    return this.lines.controls.reduce(
      (total, _line, index) => total + this.lineTotal(index),
      0,
    );
  }

  submit(): void {
    this.error.set('');

    if (
      this.form.controls.expectedDate.value &&
      this.form.controls.expectedDate.value < this.form.controls.orderDate.value
    ) {
      this.error.set('Expected date cannot be before the order date.');
      return;
    }

    if (this.lines.length === 0) {
      this.lineError.set('Add at least one product to the purchase order.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.lineError.set('');

    const value = this.form.getRawValue();
    const request: PurchaseOrderUpsertRequest = {
      supplierId: value.supplierId,
      warehouseId: value.warehouseId,
      orderDate: value.orderDate,
      expectedDate: value.expectedDate || undefined,
      notes: value.notes.trim() || undefined,
      lines: value.lines.map((line) => ({
        productId: line.productId,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
      })),
    };

    this.saving.set(true);
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);

    operation
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (item) =>
          this.router.navigate(['/purchasing', item.id], { replaceUrl: !this.editing }),
        error: (error: unknown) => this.setError(error, 'Unable to save purchase order.'),
      });
  }

  fieldError(field: 'supplierId' | 'warehouseId' | 'orderDate' | 'notes'): string {
    const control = this.form.controls[field];

    if (!control.touched) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('maxlength')) return 'Value is too long.';
    return '';
  }

  quantityError(index: number): string {
    const control = this.lines.at(index).controls.quantity;

    if (!control.touched) return '';
    if (control.hasError('required')) return 'Quantity is required.';
    if (control.hasError('min')) return 'Quantity must be greater than zero.';
    return '';
  }

  unitPriceError(index: number): string {
    const control = this.lines.at(index).controls.unitPrice;

    if (!control.touched) return '';
    if (control.hasError('required')) return 'Unit price is required.';
    if (control.hasError('min')) return 'Unit price cannot be negative.';
    return '';
  }

  private populate(item: PurchaseOrderDetail): void {
    this.form.controls.supplierId.setValue(item.supplierId);
    this.selectedSupplierLabel.set(`${item.supplierCode} — ${item.supplierName}`);
    this.form.controls.warehouseId.setValue(item.warehouseId);
    this.form.controls.orderDate.setValue(item.orderDate);
    this.form.controls.expectedDate.setValue(item.expectedDate ?? '');
    this.form.controls.notes.setValue(item.notes ?? '');

    this.lines.clear();

    for (const line of item.lines) {
      this.lines.push(
        this.createLine(
          line.productId,
          line.sku,
          line.productName,
          line.unitSymbol ?? '',
          String(line.quantity),
          String(line.unitPrice),
        ),
      );
    }
  }

  private createLine(
    productId: string,
    sku: string,
    productName: string,
    unitSymbol: string,
    quantity: string,
    unitPrice: string,
  ): PurchaseLineForm {
    return this.formBuilder.nonNullable.group({
      productId: [productId, [Validators.required]],
      sku: [sku],
      productName: [productName],
      unitSymbol: [unitSymbol],
      quantity: [quantity, [Validators.required, Validators.min(0.000001)]],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]],
    });
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
