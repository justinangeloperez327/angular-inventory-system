import { PaginationQuery } from '../../../shared/models/pagination.model';
import {
  InventoryAdjustmentDirection,
  InventoryAdjustmentStatus,
} from './inventory-adjustment.model';

export interface InventoryAdjustmentQuery extends PaginationQuery {
  readonly warehouseId?: string;
  readonly adjustmentDirection?: InventoryAdjustmentDirection;
  readonly status?: InventoryAdjustmentStatus;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

export interface InventoryAdjustmentFilters {
  readonly search: string;
  readonly warehouseId: string;
  readonly direction: string;
  readonly status: string;
  readonly dateFrom: string;
  readonly dateTo: string;
}
