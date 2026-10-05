export interface Unit {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly symbol: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UnitUpsertRequest {
  readonly code: string;
  readonly name: string;
  readonly symbol: string;
}

export interface UnitStatusRequest {
  readonly active: boolean;
}
