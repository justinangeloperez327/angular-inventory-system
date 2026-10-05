import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PERMISSIONS } from '../../../core/auth/permissions';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../../shared/ui/table/table';
import { SalesOrderDetailStore } from '../data-access/sales-order-detail.store';
import { SalesOrderStatus } from '../models/sales-order.model';

type SalesOrderAction = 'confirm' | 'cancel' | 'dispatch' | 'complete';

@Component({
  selector: 'app-sales-order-detail-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    HasPermissionDirective,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    ConfirmationDialogComponent,
    ContentContainerComponent,
    PageHeaderComponent,
    SkeletonComponent,
    TableComponent,
  ],
  providers: [SalesOrderDetailStore],
  templateUrl: './sales-order-detail-page.html',
  styleUrl: './sales-order-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesOrderDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(SalesOrderDetailStore);
  readonly permissions = PERMISSIONS;
  readonly confirmAction = signal<SalesOrderAction | null>(null);
  readonly orderId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    this.store.load(this.orderId);
  }

  statusVariant(status: SalesOrderStatus): BadgeVariant {
    switch (status) {
      case 'completed': return 'success';
      case 'dispatched': return 'info';
      case 'confirmed': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'neutral';
    }
  }

  runConfirmedAction(): void {
    const action = this.confirmAction();
    this.confirmAction.set(null);

    if (action === 'confirm') this.store.confirm(this.orderId);
    if (action === 'cancel') this.store.cancel(this.orderId);
    if (action === 'dispatch') this.store.dispatch(this.orderId);
    if (action === 'complete') this.store.complete(this.orderId);
  }
}
