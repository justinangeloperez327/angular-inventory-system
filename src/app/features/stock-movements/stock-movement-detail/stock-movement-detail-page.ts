import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { StockMovementDetailStore } from '../data-access/stock-movement-detail.store';
import {
  quantityChangeLabel,
  safeReferencePath,
  stockMovementTypeLabel,
  stockMovementTypeVariant,
} from '../stock-movement-presenter';

@Component({
  selector: 'app-stock-movement-detail-page',
  imports: [
    DatePipe,
    RouterLink,
    AlertComponent,
    BadgeComponent,
    ContentContainerComponent,
    PageHeaderComponent,
    SkeletonComponent,
  ],
  providers: [StockMovementDetailStore],
  templateUrl: './stock-movement-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockMovementDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(StockMovementDetailStore);
  readonly movementTypeLabel = stockMovementTypeLabel;
  readonly movementTypeVariant = stockMovementTypeVariant;
  readonly quantityLabel = quantityChangeLabel;
  readonly referencePath = safeReferencePath;
  readonly movementId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    this.store.load(this.movementId);
  }
}
