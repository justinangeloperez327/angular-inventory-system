import { PaginationQuery } from '../../../shared/models/pagination.model';
import { InventoryStockStatus } from './inventory.model';

export interface InventoryBalanceQuery extends PaginationQuery {
  readonly productId?: string;
  readonly warehouseId?: string;
  readonly status?: InventoryStockStatus;
}

export interface InventoryBalanceFilters {
  readonly search: string;
  readonly warehouseId: string;
  readonly status: string;
}
