export interface Warehouse {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly location?: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WarehouseUpsertRequest {
  readonly code: string;
  readonly name: string;
  readonly location?: string;
}

export interface WarehouseStatusRequest {
  readonly active: boolean;
}
