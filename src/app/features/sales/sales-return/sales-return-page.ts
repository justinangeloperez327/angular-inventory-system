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
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea';
import { SalesOrderApiService } from '../data-access/sales-order-api.service';
import { SalesOrderDetail, SalesReturnRequest } from '../models/sales-order.model';

type ReturnLineForm = FormGroup<{
  salesOrderLineId: FormControl<string>;
  sku: FormControl<string>;
  productName: FormControl<string>;
  unitSymbol: FormControl<string>;
  returnableQuantity: FormControl<string>;
  quantity: FormControl<string>;
}>;

@Component({
  selector: 'app-sales-return-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    ContentContainerComponent,
    InputComponent,
    PageHeaderComponent,
    SkeletonComponent,
    TextareaComponent,
  ],
  templateUrl: './sales-return-page.html',
  styleUrl: './sales-return-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesReturnPage implements OnInit {
  private readonly api = inject(SalesOrderApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly orderId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly lineError = signal('');
  readonly order = signal<SalesOrderDetail | null>(null);
  readonly lines = new FormArray<ReturnLineForm>([]);

  readonly form = this.formBuilder.nonNullable.group({
    notes: ['', [Validators.maxLength(1000)]],
    lines: this.lines,
  });

  ngOnInit(): void {
    this.api.get(this.orderId).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (order) => {
        if (order.status !== 'dispatched' && order.status !== 'completed') {
          void this.router.navigate(['/sales', order.id], { replaceUrl: true });
          return;
        }

        this.order.set(order);

        for (const line of order.lines) {
          const returnable = Math.max(0, line.quantityDispatched - line.quantityReturned);
          if (returnable <= 0) continue;

          this.lines.push(
            this.formBuilder.nonNullable.group({
              salesOrderLineId: [line.id],
              sku: [line.sku],
              productName: [line.productName],
              unitSymbol: [line.unitSymbol ?? ''],
              returnableQuantity: [String(returnable)],
              quantity: ['', [Validators.min(0)]],
            }),
          );
        }

        if (this.lines.length === 0) {
          this.lineError.set('This sales order has no remaining quantity eligible for return.');
        }
      },
      error: (error: unknown) =>
        this.error.set(error instanceof ApiHttpError ? error.message : 'Unable to load return form.'),
    });
  }

  submit(): void {
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const positiveLines = this.lines.controls.filter(
      (line) => Number(line.controls.quantity.value || 0) > 0,
    );

    if (positiveLines.length === 0) {
      this.lineError.set('Enter a return quantity for at least one product.');
      return;
    }

    for (const line of positiveLines) {
      const quantity = Number(line.controls.quantity.value);
      const returnable = Number(line.controls.returnableQuantity.value);

      if (quantity > returnable) {
        this.lineError.set(
          `${line.controls.sku.value}: return quantity exceeds the remaining returnable quantity.`,
        );
        line.controls.quantity.markAsTouched();
        return;
      }
    }

    this.lineError.set('');

    const request: SalesReturnRequest = {
      notes: this.form.controls.notes.value.trim() || undefined,
      lines: positiveLines.map((line) => ({
        salesOrderLineId: line.controls.salesOrderLineId.value,
        quantity: Number(line.controls.quantity.value),
      })),
    };

    this.saving.set(true);

    this.api
      .createReturn(this.orderId, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/sales', this.orderId], { replaceUrl: true }),
        error: (error: unknown) =>
          this.error.set(error instanceof ApiHttpError ? error.message : 'Unable to create return.'),
      });
  }

  notesError(): string {
    const control = this.form.controls.notes;
    if (!control.touched) return '';
    return control.hasError('maxlength') ? 'Value is too long.' : '';
  }

  quantityError(index: number): string {
    const line = this.lines.at(index);
    const control = line.controls.quantity;

    if (!control.touched) return '';
    if (control.hasError('min')) return 'Quantity cannot be negative.';
    if (Number(control.value || 0) > Number(line.controls.returnableQuantity.value)) {
      return 'Quantity exceeds returnable amount.';
    }
    return '';
  }
}
