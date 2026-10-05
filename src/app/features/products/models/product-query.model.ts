import { PaginationQuery } from '../../../shared/models/pagination.model';

export interface ProductQuery extends PaginationQuery {
  readonly categoryId?: string;
  readonly unitId?: string;
  readonly active?: boolean;
}
