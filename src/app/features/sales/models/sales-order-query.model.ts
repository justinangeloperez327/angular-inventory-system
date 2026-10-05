import { PaginationQuery } from '../../../shared/models/pagination.model';
import { SalesOrderStatus } from './sales-order.model';

export interface SalesOrderQuery extends PaginationQuery {
  readonly customerId?: string;
  readonly warehouseId?: string;
  readonly status?: SalesOrderStatus;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

export interface SalesOrderFilters {
  readonly search: string;
  readonly warehouseId: string;
  readonly status: string;
  readonly dateFrom: string;
  readonly dateTo: string;
}
