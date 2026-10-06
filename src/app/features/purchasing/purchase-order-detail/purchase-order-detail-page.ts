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
import { PurchaseOrderDetailStore } from '../data-access/purchase-order-detail.store';
import { PurchaseOrderStatus } from '../models/purchase-order.model';

@Component({
  selector: 'app-purchase-order-detail-page',
  imports: [
    CurrencyPipe, DatePipe, RouterLink, HasPermissionDirective, AlertComponent, BadgeComponent,
    ButtonComponent, ConfirmationDialogComponent, ContentContainerComponent,
    PageHeaderComponent, SkeletonComponent, TableComponent,
  ],
  providers: [PurchaseOrderDetailStore],
  templateUrl: './purchase-order-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(PurchaseOrderDetailStore);
  readonly permissions = PERMISSIONS;
  readonly confirmAction = signal<'submit' | 'approve' | null>(null);
  readonly purchaseOrderId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void { this.store.load(this.purchaseOrderId); }

  statusVariant(status: PurchaseOrderStatus): BadgeVariant {
    switch (status) {
      case 'approved':
      case 'partially-received': return 'info';
      case 'received': return 'success';
      case 'cancelled': return 'danger';
      case 'submitted': return 'warning';
      default: return 'neutral';
    }
  }

  confirm(): void {
    const action = this.confirmAction();
    this.confirmAction.set(null);
    if (action === 'submit') this.store.submit(this.purchaseOrderId);
    if (action === 'approve') this.store.approve(this.purchaseOrderId);
  }
}
