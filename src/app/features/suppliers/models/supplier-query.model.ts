import { PaginationQuery } from '../../../shared/models/pagination.model';

export interface SupplierQuery extends PaginationQuery {
  readonly active?: boolean;
}

export interface SupplierFilters {
  readonly search: string;
  readonly status: string;
}
