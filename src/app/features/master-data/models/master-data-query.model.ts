import { PaginationQuery } from '../../../shared/models/pagination.model';

export interface MasterDataQuery extends PaginationQuery {
  readonly active?: boolean;
}

export interface MasterDataFilters {
  readonly search: string;
  readonly status: string;
}
