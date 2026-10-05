export interface ApiValidationError {
  readonly field: string;
  readonly messages: readonly string[];
}

export interface ApiError {
  readonly status: number;
  readonly code?: string;
  readonly message: string;
  readonly validationErrors?: readonly ApiValidationError[];
  readonly traceId?: string;
}
