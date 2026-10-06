import { PaginationQuery } from '../../../shared/models/pagination.model';

export interface AdminUserQuery extends PaginationQuery {
  readonly active?: boolean;
  readonly roleId?: string;
}

export interface AdminUserFilters {
  readonly search: string;
  readonly roleId: string;
  readonly status: string;
}
