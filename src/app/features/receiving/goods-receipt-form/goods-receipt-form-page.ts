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
import { finalize, forkJoin, of, switchMap } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea';
import { ReceiptPurchaseOrderLookupComponent } from '../components/purchase-order-lookup/receipt-purchase-order-lookup';
import { GoodsReceiptApiService } from '../data-access/goods-receipt-api.service';
import {
  GoodsReceiptDetail,
  GoodsReceiptPurchaseOrderContext,
  GoodsReceiptPurchaseOrderOption,
  GoodsReceiptUpsertRequest,
} from '../models/goods-receipt.model';

type ReceiptLineForm = FormGroup<{
  purchaseOrderLineId: FormControl<string>;
  productId: FormControl<string>;
  sku: FormControl<string>;
  productName: FormControl<string>;
  unitSymbol: FormControl<string>;
  quantityOrdered: FormControl<string>;
  quantityReceivedBefore: FormControl<string>;
  quantityRemaining: FormControl<string>;
  quantityReceived: FormControl<string>;
}>;

function localDateValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-goods-receipt-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    ContentContainerComponent,
    InputComponent,
    PageHeaderComponent,
    ReceiptPurchaseOrderLookupComponent,
    SkeletonComponent,
    TextareaComponent,
  ],
  templateUrl: './goods-receipt-form-page.html',
  styleUrl: './goods-receipt-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoodsReceiptFormPage implements OnInit {
  private readonly api = inject(GoodsReceiptApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly contextLoading = signal(false);
  readonly error = signal('');
  readonly lineError = signal('');
  readonly selectedPurchaseOrderLabel = signal('');
  readonly purchaseOrderContext = signal<GoodsReceiptPurchaseOrderContext | null>(null);

  readonly lines = new FormArray<ReceiptLineForm>([], [Validators.minLength(1)]);

  readonly form = this.formBuilder.nonNullable.group({
    purchaseOrderId: ['', [Validators.required]],
    receiptDate: [localDateValue(), [Validators.required]],
    supplierDeliveryReference: ['', [Validators.maxLength(100)]],
    notes: ['', [Validators.maxLength(1000)]],
    lines: this.lines,
  });

  ngOnInit(): void {
    if (this.id) {
      this.loadExisting(this.id);
      return;
    }

    const purchaseOrderId = this.route.snapshot.queryParamMap.get('purchaseOrderId');

    if (purchaseOrderId) {
      this.loading.set(false);
      this.loadPurchaseOrderContext(purchaseOrderId);
      return;
    }

    this.loading.set(false);
  }

  selectPurchaseOrder(option: GoodsReceiptPurchaseOrderOption): void {
    if (!this.editing) {
      this.loadPurchaseOrderContext(option.id);
    }
  }

  clearPurchaseOrder(): void {
    if (this.editing) {
      return;
    }

    this.form.controls.purchaseOrderId.setValue('');
    this.form.controls.purchaseOrderId.markAsTouched();
    this.selectedPurchaseOrderLabel.set('');
    this.purchaseOrderContext.set(null);
    this.lines.clear();
  }

  submit(): void {
    this.error.set('');

    const positiveLines = this.lines.controls.filter(
      (line) => Number(line.controls.quantityReceived.value || 0) > 0,
    );

    if (positiveLines.length === 0) {
      this.lineError.set('Enter a received quantity for at least one product.');
      return;
    }

    for (const line of positiveLines) {
      const quantity = Number(line.controls.quantityReceived.value);
      const remaining = Number(line.controls.quantityRemaining.value);

      if (quantity > remaining) {
        this.lineError.set(
          `${line.controls.sku.value}: received quantity cannot exceed the current PO remaining quantity.`,
        );
        line.controls.quantityReceived.markAsTouched();
        return;
      }
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.lineError.set('');

    const value = this.form.getRawValue();
    const request: GoodsReceiptUpsertRequest = {
      purchaseOrderId: value.purchaseOrderId,
      receiptDate: value.receiptDate,
      supplierDeliveryReference: value.supplierDeliveryReference.trim() || undefined,
      notes: value.notes.trim() || undefined,
      lines: value.lines
        .filter((line) => Number(line.quantityReceived || 0) > 0)
        .map((line) => ({
          purchaseOrderLineId: line.purchaseOrderLineId,
          quantityReceived: Number(line.quantityReceived),
        })),
    };

    this.saving.set(true);
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);

    operation
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (item) =>
          this.router.navigate(['/receiving', item.id], { replaceUrl: !this.editing }),
        error: (error: unknown) => this.setError(error, 'Unable to save goods receipt.'),
      });
  }

  fieldError(
    field: 'purchaseOrderId' | 'receiptDate' | 'supplierDeliveryReference' | 'notes',
  ): string {
    const control = this.form.controls[field];

    if (!control.touched) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('maxlength')) return 'Value is too long.';
    return '';
  }

  quantityError(index: number): string {
    const control = this.lines.at(index).controls.quantityReceived;
    const remaining = Number(this.lines.at(index).controls.quantityRemaining.value);

    if (!control.touched) return '';
    if (control.hasError('min')) return 'Quantity cannot be negative.';

    const value = Number(control.value || 0);
    if (value > remaining) return 'Quantity cannot exceed remaining PO quantity.';
    return '';
  }

  private loadExisting(id: string): void {
    this.api
      .get(id)
      .pipe(
        switchMap((receipt) => {
          if (receipt.status !== 'draft') {
            void this.router.navigate(['/receiving', receipt.id], { replaceUrl: true });
            return of(null);
          }

          return forkJoin({
            receipt: of(receipt),
            context: this.api.getPurchaseOrderContext(receipt.purchaseOrderId),
          });
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.populateDraft(result.receipt, result.context);
          }
        },
        error: (error: unknown) =>
          this.setError(error, 'Unable to load current purchase-order context for this draft.'),
      });
  }

  private populateDraft(
    receipt: GoodsReceiptDetail,
    context: GoodsReceiptPurchaseOrderContext,
  ): void {
    this.purchaseOrderContext.set(context);
    this.form.controls.purchaseOrderId.setValue(receipt.purchaseOrderId);
    this.form.controls.receiptDate.setValue(receipt.receiptDate);
    this.form.controls.supplierDeliveryReference.setValue(
      receipt.supplierDeliveryReference ?? '',
    );
    this.form.controls.notes.setValue(receipt.notes ?? '');
    this.selectedPurchaseOrderLabel.set(
      `${receipt.purchaseOrderNumber} — ${receipt.supplierName}`,
    );

    const draftQuantityByLine = new Map(
      receipt.lines.map((line) => [line.purchaseOrderLineId, line.quantityReceived] as const),
    );

    this.lines.clear();

    for (const line of context.lines) {
      const draftQuantity = draftQuantityByLine.get(line.id) ?? 0;

      if (line.quantityRemaining <= 0 && draftQuantity <= 0) {
        continue;
      }

      this.lines.push(
        this.createLine(
          line.id,
          line.productId,
          line.sku,
          line.productName,
          line.unitSymbol ?? '',
          line.quantityOrdered,
          line.quantityReceived,
          line.quantityRemaining,
          draftQuantity,
        ),
      );
    }

    const staleLine = this.lines.controls.find(
      (line) =>
        Number(line.controls.quantityReceived.value || 0) >
        Number(line.controls.quantityRemaining.value),
    );

    if (staleLine) {
      this.lineError.set(
        'This draft contains quantities above the purchase order’s current remaining balance. Review them before saving or posting.',
      );
    } else if (this.lines.length === 0) {
      this.lineError.set('This purchase order has no remaining quantity to receive.');
    } else {
      this.lineError.set('');
    }
  }

  private loadPurchaseOrderContext(purchaseOrderId: string): void {
    if (this.contextLoading()) return;

    this.contextLoading.set(true);
    this.error.set('');

    this.api
      .getPurchaseOrderContext(purchaseOrderId)
      .pipe(finalize(() => this.contextLoading.set(false)))
      .subscribe({
        next: (context) => this.populateContext(context),
        error: (error: unknown) =>
          this.setError(error, 'Unable to load purchase order for receiving.'),
      });
  }

  private populateContext(context: GoodsReceiptPurchaseOrderContext): void {
    this.purchaseOrderContext.set(context);
    this.form.controls.purchaseOrderId.setValue(context.id);
    this.form.controls.purchaseOrderId.markAsTouched();
    this.selectedPurchaseOrderLabel.set(`${context.number} — ${context.supplierName}`);
    this.lines.clear();

    for (const line of context.lines.filter((item) => item.quantityRemaining > 0)) {
      this.lines.push(
        this.createLine(
          line.id,
          line.productId,
          line.sku,
          line.productName,
          line.unitSymbol ?? '',
          line.quantityOrdered,
          line.quantityReceived,
          line.quantityRemaining,
          0,
        ),
      );
    }

    if (this.lines.length === 0) {
      this.lineError.set('This purchase order has no remaining quantity to receive.');
    } else {
      this.lineError.set('');
    }
  }

  private createLine(
    purchaseOrderLineId: string,
    productId: string,
    sku: string,
    productName: string,
    unitSymbol: string,
    quantityOrdered: number,
    quantityReceivedBefore: number,
    quantityRemaining: number,
    quantityReceived: number,
  ): ReceiptLineForm {
    return this.formBuilder.nonNullable.group({
      purchaseOrderLineId: [purchaseOrderLineId, [Validators.required]],
      productId: [productId],
      sku: [sku],
      productName: [productName],
      unitSymbol: [unitSymbol],
      quantityOrdered: [String(quantityOrdered)],
      quantityReceivedBefore: [String(quantityReceivedBefore)],
      quantityRemaining: [String(quantityRemaining)],
      quantityReceived: [
        quantityReceived ? String(quantityReceived) : '',
        [Validators.min(0)],
      ],
    });
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
