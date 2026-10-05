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
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../../shared/ui/table/table';
import { SupplierDetailStore } from '../data-access/supplier-detail.store';
import { SupplierPurchaseOrderStatus } from '../models/supplier-purchase-history.model';

@Component({
  selector: 'app-supplier-detail-page',
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
    EmptyStateComponent,
    PageHeaderComponent,
    PaginationComponent,
    SkeletonComponent,
    TableComponent,
  ],
  providers: [SupplierDetailStore],
  templateUrl: './supplier-detail-page.html',
  styleUrl: './supplier-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(SupplierDetailStore);
  readonly permissions = PERMISSIONS;
  readonly confirmDeactivate = signal(false);
  readonly supplierId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    this.store.load(this.supplierId);
  }

  purchaseStatusVariant(status: SupplierPurchaseOrderStatus): BadgeVariant {
    switch (status) {
      case 'approved':
      case 'partially-received':
        return 'info';
      case 'received':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'submitted':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  deactivate(): void {
    this.confirmDeactivate.set(false);
    this.store.setActive(false);
  }
}
