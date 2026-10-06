import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PERMISSIONS } from '../../core/auth/permissions';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { AlertComponent } from '../../shared/ui/alert/alert';
import { BadgeComponent } from '../../shared/ui/badge/badge';
import { ButtonComponent } from '../../shared/ui/button/button';
import { ContentContainerComponent } from '../../shared/ui/content-container/content-container';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../shared/ui/table/table';
import { MetricCardComponent } from './components/metric-card/metric-card';
import { DashboardStore } from './data-access/dashboard.store';
import {
  DashboardMovementType,
  DashboardStockRiskItem,
} from './models/dashboard.model';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    HasPermissionDirective,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    ContentContainerComponent,
    EmptyStateComponent,
    MetricCardComponent,
    PageHeaderComponent,
    SkeletonComponent,
    TableComponent,
  ],
  providers: [DashboardStore],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  readonly store = inject(DashboardStore);
  readonly permissions = PERMISSIONS;

  private readonly outboundMovements = new Set<DashboardMovementType>([
    'sale',
    'transfer-out',
    'adjustment-out',
    'return-out',
  ]);

  ngOnInit(): void {
    this.store.load();
  }

  stockRiskBadge(item: DashboardStockRiskItem): 'warning' | 'danger' {
    return item.status === 'out-of-stock' ? 'danger' : 'warning';
  }

  stockRiskLabel(item: DashboardStockRiskItem): string {
    return item.status === 'out-of-stock' ? 'Out of stock' : 'Low stock';
  }

  movementLabel(type: DashboardMovementType): string {
    return type
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  signedQuantity(type: DashboardMovementType, quantity: number): string {
    return `${this.isOutbound(type) ? '−' : '+'}${Math.abs(quantity)}`;
  }

  isOutbound(type: DashboardMovementType): boolean {
    return this.outboundMovements.has(type);
  }
}
