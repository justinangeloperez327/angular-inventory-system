import { PaginationQuery } from '../../../shared/models/pagination.model';
import { StockCountStatus } from './stock-count.model';

export interface StockCountQuery extends PaginationQuery {
  readonly warehouseId?: string;
  readonly status?: StockCountStatus;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

export interface StockCountFilters {
  readonly search: string;
  readonly warehouseId: string;
  readonly status: string;
  readonly dateFrom: string;
  readonly dateTo: string;
}

export interface StockCountLineQuery extends PaginationQuery {
  readonly varianceOnly?: boolean;
}
