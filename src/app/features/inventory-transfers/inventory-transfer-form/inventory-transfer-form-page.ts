import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormBuilder,
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
import { TransferProductLookupComponent } from '../components/product-lookup/transfer-product-lookup';
import { InventoryTransferApiService } from '../data-access/inventory-transfer-api.service';
import {
  InventoryTransferDetail,
  InventoryTransferFormOptions,
  InventoryTransferProductOption,
  InventoryTransferUpsertRequest,
} from '../models/inventory-transfer.model';

type TransferLineForm = FormGroup<{
  productId: FormControl<string>;
  sku: FormControl<string>;
  productName: FormControl<string>;
  unitSymbol: FormControl<string>;
  quantityAvailable: FormControl<string>;
  quantity: FormControl<string>;
}>;

@Component({
  selector: 'app-inventory-transfer-form-page',
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
    TransferProductLookupComponent,
  ],
  templateUrl: './inventory-transfer-form-page.html',
  styleUrl: './inventory-transfer-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryTransferFormPage implements OnInit {
  private readonly api = inject(InventoryTransferApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private previousSourceWarehouseId = '';

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly lineError = signal('');
  readonly options = signal<InventoryTransferFormOptions | null>(null);

  readonly lines = new FormArray<TransferLineForm>([], [Validators.minLength(1)]);

  readonly form = this.formBuilder.nonNullable.group({
    sourceWarehouseId: ['', [Validators.required]],
    destinationWarehouseId: ['', [Validators.required]],
    notes: ['', [Validators.maxLength(1000)]],
    lines: this.lines,
  });

  constructor() {
    this.form.controls.sourceWarehouseId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((sourceWarehouseId) => {
        if (
          this.previousSourceWarehouseId &&
          sourceWarehouseId !== this.previousSourceWarehouseId &&
          this.lines.length > 0
        ) {
          this.lines.clear();
          this.lineError.set('Products were cleared because the source warehouse changed.');
        }

        if (this.form.controls.destinationWarehouseId.value === sourceWarehouseId) {
          this.form.controls.destinationWarehouseId.setValue('');
        }

        this.previousSourceWarehouseId = sourceWarehouseId;
      });
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
              void this.router.navigate(['/transfers', item.id], { replaceUrl: true });
              return;
            }

            this.populate(item);
          }
        },
        error: (error: unknown) => {
          this.error.set(
            error instanceof ApiHttpError
              ? error.message
              : 'Unable to load transfer form.',
          );
        },
      });
  }

  sourceWarehouseOptions(): readonly SelectOption[] {
    return (this.options()?.warehouses ?? []).map((warehouse) => ({
      label: `${warehouse.code} — ${warehouse.name}`,
      value: warehouse.id,
    }));
  }

  destinationWarehouseOptions(): readonly SelectOption[] {
    const sourceWarehouseId = this.form.controls.sourceWarehouseId.value;

    return (this.options()?.warehouses ?? [])
      .filter((warehouse) => warehouse.id !== sourceWarehouseId)
      .map((warehouse) => ({
        label: `${warehouse.code} — ${warehouse.name}`,
        value: warehouse.id,
      }));
  }

  addProduct(product: InventoryTransferProductOption): void {
    const exists = this.lines.controls.some(
      (line) => line.controls.productId.value === product.id,
    );

    if (exists) {
      this.lineError.set('This product is already included in the transfer.');
      return;
    }

    this.lineError.set('');
    this.lines.push(
      this.createLine(
        product.id,
        product.sku,
        product.name,
        product.unitSymbol ?? '',
        String(product.quantityAvailable),
        '',
      ),
    );
  }

  removeLine(index: number): void {
    this.lines.removeAt(index);
  }

  submit(): void {
    this.error.set('');

    const sourceWarehouseId = this.form.controls.sourceWarehouseId.value;
    const destinationWarehouseId = this.form.controls.destinationWarehouseId.value;

    if (
      sourceWarehouseId &&
      destinationWarehouseId &&
      sourceWarehouseId === destinationWarehouseId
    ) {
      this.error.set('Source and destination warehouses must be different.');
      return;
    }

    if (this.lines.length === 0) {
      this.lineError.set('Add at least one product to the transfer.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.lineError.set('');

    const value = this.form.getRawValue();
    const request: InventoryTransferUpsertRequest = {
      sourceWarehouseId: value.sourceWarehouseId,
      destinationWarehouseId: value.destinationWarehouseId,
      notes: value.notes.trim() || undefined,
      lines: value.lines.map((line) => ({
        productId: line.productId,
        quantity: Number(line.quantity),
      })),
    };

    this.saving.set(true);
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);

    operation
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (item) =>
          this.router.navigate(['/transfers', item.id], { replaceUrl: !this.editing }),
        error: (error: unknown) => {
          this.error.set(
            error instanceof ApiHttpError ? error.message : 'Unable to save transfer.',
          );
        },
      });
  }

  fieldError(field: 'sourceWarehouseId' | 'destinationWarehouseId' | 'notes'): string {
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

  private populate(item: InventoryTransferDetail): void {
    this.form.controls.sourceWarehouseId.setValue(item.sourceWarehouseId);
    this.previousSourceWarehouseId = item.sourceWarehouseId;
    this.form.controls.destinationWarehouseId.setValue(item.destinationWarehouseId);
    this.form.controls.notes.setValue(item.notes ?? '');

    this.lines.clear();

    for (const line of item.lines) {
      this.lines.push(
        this.createLine(
          line.productId,
          line.sku,
          line.productName,
          line.unitSymbol ?? '',
          '',
          String(line.quantity),
        ),
      );
    }

    this.lineError.set('');
  }

  private createLine(
    productId: string,
    sku: string,
    productName: string,
    unitSymbol: string,
    quantityAvailable: string,
    quantity: string,
  ): TransferLineForm {
    return this.formBuilder.nonNullable.group({
      productId: [productId, [Validators.required]],
      sku: [sku],
      productName: [productName],
      unitSymbol: [unitSymbol],
      quantityAvailable: [quantityAvailable],
      quantity: [quantity, [Validators.required, Validators.min(0.000001)]],
    });
  }
}
