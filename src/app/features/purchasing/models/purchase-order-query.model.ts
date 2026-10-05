import { PaginationQuery } from '../../../shared/models/pagination.model';
import { PurchaseOrderStatus } from './purchase-order.model';

export interface PurchaseOrderQuery extends PaginationQuery {
  readonly supplierId?: string;
  readonly warehouseId?: string;
  readonly status?: PurchaseOrderStatus;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

export interface PurchaseOrderFilters {
  readonly search: string;
  readonly warehouseId: string;
  readonly status: string;
  readonly dateFrom: string;
  readonly dateTo: string;
}
