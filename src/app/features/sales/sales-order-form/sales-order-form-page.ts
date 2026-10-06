import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { SalesCustomerLookupComponent } from '../components/customer-lookup/sales-customer-lookup';
import { SalesProductLookupComponent } from '../components/product-lookup/sales-product-lookup';
import { SalesOrderApiService } from '../data-access/sales-order-api.service';
import {
  SalesOrderCustomerOption,
  SalesOrderDetail,
  SalesOrderFormOptions,
  SalesOrderProductOption,
  SalesOrderUpsertRequest,
} from '../models/sales-order.model';

type SalesLineForm = FormGroup<{
  productId: FormControl<string>;
  sku: FormControl<string>;
  productName: FormControl<string>;
  unitSymbol: FormControl<string>;
  quantityAvailable: FormControl<string>;
  quantity: FormControl<string>;
  unitPrice: FormControl<string>;
}>;

function localDateValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-sales-order-form-page',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    ContentContainerComponent,
    InputComponent,
    PageHeaderComponent,
    SalesCustomerLookupComponent,
    SalesProductLookupComponent,
    SelectComponent,
    SkeletonComponent,
    TextareaComponent,
  ],
  templateUrl: './sales-order-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesOrderFormPage implements OnInit {
  private readonly api = inject(SalesOrderApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private previousWarehouseId = '';

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly lineError = signal('');
  readonly options = signal<SalesOrderFormOptions | null>(null);
  readonly selectedCustomerLabel = signal('');

  readonly lines = new FormArray<SalesLineForm>([], [Validators.minLength(1)]);

  readonly form = this.formBuilder.nonNullable.group({
    customerId: ['', [Validators.required]],
    warehouseId: ['', [Validators.required]],
    orderDate: [localDateValue(), [Validators.required]],
    notes: ['', [Validators.maxLength(1000)]],
    lines: this.lines,
  });

  constructor() {
    this.form.controls.warehouseId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((warehouseId) => {
        if (
          this.previousWarehouseId &&
          warehouseId !== this.previousWarehouseId &&
          this.lines.length > 0
        ) {
          this.lines.clear();
          this.lineError.set('Products were cleared because the warehouse changed.');
        }
        this.previousWarehouseId = warehouseId;
      });
  }

  ngOnInit(): void {
    const itemRequest = this.id ? this.api.get(this.id) : of(null);
    const customerId = !this.id ? this.route.snapshot.queryParamMap.get('customerId') : null;
    const customerRequest = customerId ? this.api.getCustomerOption(customerId) : of(null);

    forkJoin({
      options: this.api.getFormOptions(),
      item: itemRequest,
      customer: customerRequest,
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ options, item, customer }) => {
          this.options.set(options);

          if (item) {
            if (item.status !== 'draft') {
              void this.router.navigate(['/sales', item.id], { replaceUrl: true });
              return;
            }
            this.populate(item);
          } else if (customer) {
            this.selectCustomer(customer);
          }
        },
        error: (error: unknown) => this.setError(error, 'Unable to load sales order form.'),
      });
  }

  warehouseOptions(): readonly SelectOption[] {
    return (this.options()?.warehouses ?? []).map((item) => ({
      label: `${item.code} — ${item.name}`,
      value: item.id,
    }));
  }

  selectCustomer(item: SalesOrderCustomerOption): void {
    this.form.controls.customerId.setValue(item.id);
    this.form.controls.customerId.markAsTouched();
    this.selectedCustomerLabel.set(`${item.code} — ${item.name}`);
  }

  clearCustomer(): void {
    this.form.controls.customerId.setValue('');
    this.form.controls.customerId.markAsTouched();
    this.selectedCustomerLabel.set('');
  }

  addProduct(item: SalesOrderProductOption): void {
    if (this.lines.controls.some((line) => line.controls.productId.value === item.id)) {
      this.lineError.set('This product is already included in the sales order.');
      return;
    }

    this.lineError.set('');
    this.lines.push(this.createLine(
      item.id, item.sku, item.name, item.unitSymbol ?? '',
      String(item.quantityAvailable), '', String(item.defaultUnitPrice ?? ''),
    ));
  }

  removeLine(index: number): void {
    this.lines.removeAt(index);
  }

  lineTotal(index: number): number {
    const line = this.lines.at(index).getRawValue();
    return Number(line.quantity || 0) * Number(line.unitPrice || 0);
  }

  subtotal(): number {
    return this.lines.controls.reduce((total, _line, index) => total + this.lineTotal(index), 0);
  }

  submit(): void {
    this.error.set('');

    if (this.lines.length === 0) {
      this.lineError.set('Add at least one product to the sales order.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.lineError.set('');
    const value = this.form.getRawValue();
    const request: SalesOrderUpsertRequest = {
      customerId: value.customerId,
      warehouseId: value.warehouseId,
      orderDate: value.orderDate,
      notes: value.notes.trim() || undefined,
      lines: value.lines.map((line) => ({
        productId: line.productId,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
      })),
    };

    this.saving.set(true);
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);

    operation.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (item) => this.router.navigate(['/sales', item.id], { replaceUrl: !this.editing }),
      error: (error: unknown) => this.setError(error, 'Unable to save sales order.'),
    });
  }

  fieldError(field: 'customerId' | 'warehouseId' | 'orderDate' | 'notes'): string {
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

  private populate(item: SalesOrderDetail): void {
    this.form.controls.customerId.setValue(item.customerId);
    this.selectedCustomerLabel.set(`${item.customerCode} — ${item.customerName}`);
    this.form.controls.warehouseId.setValue(item.warehouseId);
    this.previousWarehouseId = item.warehouseId;
    this.form.controls.orderDate.setValue(item.orderDate);
    this.form.controls.notes.setValue(item.notes ?? '');

    this.lines.clear();
    for (const line of item.lines) {
      this.lines.push(this.createLine(
        line.productId, line.sku, line.productName, line.unitSymbol ?? '',
        '', String(line.quantity), String(line.unitPrice),
      ));
    }
  }

  private createLine(
    productId: string,
    sku: string,
    productName: string,
    unitSymbol: string,
    quantityAvailable: string,
    quantity: string,
    unitPrice: string,
  ): SalesLineForm {
    return this.formBuilder.nonNullable.group({
      productId: [productId, [Validators.required]],
      sku: [sku],
      productName: [productName],
      unitSymbol: [unitSymbol],
      quantityAvailable: [quantityAvailable],
      quantity: [quantity, [Validators.required, Validators.min(0.000001)]],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]],
    });
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
