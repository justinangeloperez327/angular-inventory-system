import { ApiError, ApiValidationError } from '../../shared/models/api-error.model';

export class ApiHttpError extends Error implements ApiError {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
    readonly validationErrors?: readonly ApiValidationError[],
    readonly traceId?: string,
  ) {
    super(message);
    this.name = 'ApiHttpError';
  }
}
