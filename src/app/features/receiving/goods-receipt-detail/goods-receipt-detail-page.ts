import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../../shared/ui/table/table';
import { GoodsReceiptDetailStore } from '../data-access/goods-receipt-detail.store';
import { GoodsReceiptStatus } from '../models/goods-receipt.model';

@Component({
  selector: 'app-goods-receipt-detail-page',
  imports: [
    DatePipe,
    RouterLink,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    ConfirmationDialogComponent,
    ContentContainerComponent,
    PageHeaderComponent,
    SkeletonComponent,
    TableComponent,
  ],
  providers: [GoodsReceiptDetailStore],
  templateUrl: './goods-receipt-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoodsReceiptDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(GoodsReceiptDetailStore);
  readonly confirmPost = signal(false);
  readonly receiptId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    this.store.load(this.receiptId);
  }

  statusVariant(status: GoodsReceiptStatus): BadgeVariant {
    return status === 'posted' ? 'success' : status === 'cancelled' ? 'danger' : 'warning';
  }

  post(): void {
    this.confirmPost.set(false);
    this.store.post(this.receiptId);
  }
}
