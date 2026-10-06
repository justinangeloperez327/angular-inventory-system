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
import { TableComponent } from '../../../shared/ui/table/table';
import { InventoryTransferDetailStore } from '../data-access/inventory-transfer-detail.store';
import { InventoryTransferStatus } from '../models/inventory-transfer.model';

@Component({
  selector: 'app-inventory-transfer-detail-page',
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
    TableComponent,
  ],
  providers: [InventoryTransferDetailStore],
  templateUrl: './inventory-transfer-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryTransferDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(InventoryTransferDetailStore);
  readonly permissions = PERMISSIONS;
  readonly confirmPost = signal(false);
  readonly transferId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    this.store.load(this.transferId);
  }

  statusVariant(status: InventoryTransferStatus): BadgeVariant {
    return status === 'posted'
      ? 'success'
      : status === 'cancelled'
        ? 'danger'
        : 'warning';
  }

  post(): void {
    this.confirmPost.set(false);
    this.store.post(this.transferId);
  }
}
