import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PERMISSIONS } from '../../../core/auth/permissions';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../../shared/ui/table/table';
import { StockCountDetailStore } from '../data-access/stock-count-detail.store';
import { StockCountLine, StockCountStatus } from '../models/stock-count.model';

type CountLineForm = FormGroup<{
  lineId: FormControl<string>;
  countedQuantity: FormControl<string>;
}>;

@Component({
  selector: 'app-stock-count-detail-page',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    HasPermissionDirective,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    ConfirmationDialogComponent,
    ContentContainerComponent,
    InputComponent,
    PageHeaderComponent,
    PaginationComponent,
    SkeletonComponent,
    TableComponent,
  ],
  providers: [StockCountDetailStore],
  templateUrl: './stock-count-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockCountDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly store = inject(StockCountDetailStore);
  readonly permissions = PERMISSIONS;
  readonly confirmAction = signal<'start' | 'submit' | 'post' | null>(null);
  readonly lineMessage = signal('');
  readonly search = new FormControl('', { nonNullable: true });
  readonly varianceOnly = new FormControl(false, { nonNullable: true });
  readonly countId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly lineForms = signal<readonly CountLineForm[]>([]);

  constructor() {
    effect(() => {
      const lines = this.store.lines();
      const status = this.store.count()?.status;

      if (status === 'counting') {
        this.buildLineForms(lines);
      } else {
        this.lineForms.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.store.load(this.countId);
  }

  statusVariant(status: StockCountStatus): BadgeVariant {
    switch (status) {
      case 'posted': return 'success';
      case 'submitted': return 'info';
      case 'counting': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'neutral';
    }
  }

  savePage(): void {
    const forms = this.lineForms();

    for (const form of forms) {
      if (form.invalid) {
        form.markAllAsTouched();
        this.lineMessage.set('Complete every count on this page before saving.');
        return;
      }
    }

    this.lineMessage.set('');
    this.store.saveLines(
      this.countId,
      forms.map((form) => ({
        lineId: form.controls.lineId.value,
        countedQuantity: Number(form.controls.countedQuantity.value),
      })),
    );
  }

  applyLineFilter(): void {
    if (this.hasUnsavedLineChanges()) {
      this.lineMessage.set('Save the current page before changing filters.');
      return;
    }

    this.lineMessage.set('');
    this.store.setLineFilter(this.countId, this.search.value, this.varianceOnly.value);
  }

  changeLinePage(page: number): void {
    if (this.hasUnsavedLineChanges()) {
      this.lineMessage.set('Save the current page before changing pages.');
      return;
    }

    this.lineMessage.set('');
    this.store.setLinePage(this.countId, page);
  }

  confirm(): void {
    const action = this.confirmAction();
    this.confirmAction.set(null);

    if (action === 'start') this.store.start(this.countId);
    if (action === 'submit') this.store.submit(this.countId);
    if (action === 'post') this.store.approveAndPost(this.countId);
  }

  lineForm(index: number): CountLineForm {
    return this.lineForms()[index]!;
  }

  quantityError(form: CountLineForm): string {
    const control = form.controls.countedQuantity;

    if (!control.touched) return '';
    if (control.hasError('required')) return 'Required.';
    if (control.hasError('min')) return 'Cannot be negative.';
    return '';
  }

  private buildLineForms(lines: readonly StockCountLine[]): void {
    this.lineForms.set(
      lines.map((line) =>
        this.formBuilder.nonNullable.group({
          lineId: [line.id],
          countedQuantity: [
            line.countedQuantity === null ? '' : String(line.countedQuantity),
            [Validators.required, Validators.min(0)],
          ],
        }),
      ),
    );
  }

  private hasUnsavedLineChanges(): boolean {
    return this.lineForms().some((form) => form.dirty);
  }
}
