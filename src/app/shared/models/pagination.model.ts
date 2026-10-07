export interface PaginationQuery {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string;
  readonly sort?: string;
  readonly direction?: 'asc' | 'desc';
}

export interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly pagination: PaginationMeta;
}

export const DEFAULT_PAGINATION: PaginationQuery = {
  page: 1,
  pageSize: 25,
};

export const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: DEFAULT_PAGINATION.pageSize,
  totalItems: 0,
  totalPages: 0,
};
