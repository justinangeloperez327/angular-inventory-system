import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { InventoryTotals } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory-totals',
  templateUrl: './inventory-totals.html',
  styleUrl: './inventory-totals.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryTotalsComponent {
  @Input({ required: true }) totals!: InventoryTotals;
}
