import { PaginationQuery } from '../../../shared/models/pagination.model';
import { GoodsReceiptStatus } from './goods-receipt.model';

export interface GoodsReceiptQuery extends PaginationQuery {
  readonly purchaseOrderId?: string;
  readonly warehouseId?: string;
  readonly status?: GoodsReceiptStatus;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

export interface GoodsReceiptFilters {
  readonly search: string;
  readonly warehouseId: string;
  readonly status: string;
  readonly dateFrom: string;
  readonly dateTo: string;
}
