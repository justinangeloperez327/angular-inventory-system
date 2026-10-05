import { PaginationQuery } from '../../../shared/models/pagination.model';
import { StockMovementType } from './stock-movement.model';

export interface StockMovementQuery extends PaginationQuery {
  readonly productId?: string;
  readonly warehouseId?: string;
  readonly type?: StockMovementType;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly reference?: string;
}

export interface StockMovementFilters {
  readonly search: string;
  readonly warehouseId: string;
  readonly type: string;
  readonly dateFrom: string;
  readonly dateTo: string;
  readonly reference: string;
}
