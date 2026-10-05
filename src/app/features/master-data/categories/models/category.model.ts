export interface Category {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CategoryUpsertRequest {
  readonly code: string;
  readonly name: string;
  readonly description?: string;
}

export interface CategoryStatusRequest {
  readonly active: boolean;
}
