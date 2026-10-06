import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
import { InventoryAdjustmentDetailStore } from '../data-access/inventory-adjustment-detail.store';
import {
  InventoryAdjustmentDirection,
  InventoryAdjustmentStatus,
} from '../models/inventory-adjustment.model';

@Component({
  selector: 'app-inventory-adjustment-detail-page',
  imports: [
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
  ],
  providers: [InventoryAdjustmentDetailStore],
  templateUrl: './inventory-adjustment-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryAdjustmentDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(InventoryAdjustmentDetailStore);
  readonly permissions = PERMISSIONS;
  readonly confirmPost = signal(false);
  readonly adjustmentId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    this.store.load(this.adjustmentId);
  }

  statusVariant(status: InventoryAdjustmentStatus): BadgeVariant {
    return status === 'posted'
      ? 'success'
      : status === 'cancelled'
        ? 'danger'
        : 'warning';
  }

  directionVariant(direction: InventoryAdjustmentDirection): BadgeVariant {
    return direction === 'increase' ? 'success' : 'neutral';
  }

  signedQuantity(direction: InventoryAdjustmentDirection, quantity: number): string {
    return `${direction === 'increase' ? '+' : '−'}${quantity}`;
  }

  post(): void {
    this.confirmPost.set(false);
    this.store.post(this.adjustmentId);
  }
}
