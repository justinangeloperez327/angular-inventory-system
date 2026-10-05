import { PaginationQuery } from '../../../shared/models/pagination.model';
import { InventoryTransferStatus } from './inventory-transfer.model';

export interface InventoryTransferQuery extends PaginationQuery {
  readonly sourceWarehouseId?: string;
  readonly destinationWarehouseId?: string;
  readonly status?: InventoryTransferStatus;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

export interface InventoryTransferFilters {
  readonly search: string;
  readonly sourceWarehouseId: string;
  readonly destinationWarehouseId: string;
  readonly status: string;
  readonly dateFrom: string;
  readonly dateTo: string;
}
