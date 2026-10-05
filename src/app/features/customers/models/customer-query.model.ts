import { PaginationQuery } from '../../../shared/models/pagination.model';

export interface CustomerQuery extends PaginationQuery {
  readonly active?: boolean;
}

export interface CustomerFilters {
  readonly search: string;
  readonly status: string;
}
