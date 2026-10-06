import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../../shared/ui/table/table';
import { InventoryTotalsComponent } from '../components/inventory-totals/inventory-totals';
import { ProductInventoryStore } from '../data-access/product-inventory.store';
import { InventoryStockStatus } from '../models/inventory.model';

@Component({
  selector: 'app-product-inventory-page',
  imports: [
    DatePipe,
    RouterLink,
    AlertComponent,
    BadgeComponent,
    ContentContainerComponent,
    EmptyStateComponent,
    InventoryTotalsComponent,
    PageHeaderComponent,
    PaginationComponent,
    SkeletonComponent,
    TableComponent,
  ],
  providers: [ProductInventoryStore],
  templateUrl: './product-inventory-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInventoryPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(ProductInventoryStore);
  readonly productId = this.route.snapshot.paramMap.get('productId') ?? '';

  ngOnInit(): void {
    this.store.load(this.productId);
  }

  statusVariant(status: InventoryStockStatus): BadgeVariant {
    return status === 'out-of-stock' ? 'danger' : status === 'low-stock' ? 'warning' : 'success';
  }

  statusLabel(status: InventoryStockStatus): string {
    return status === 'out-of-stock' ? 'Out of stock' : status === 'low-stock' ? 'Low stock' : 'In stock';
  }
}
