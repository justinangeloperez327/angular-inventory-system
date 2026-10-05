import { HttpErrorResponse } from '@angular/common/http';

import { ApiValidationError } from '../../shared/models/api-error.model';
import { ApiHttpError } from './api-http-error';

type JsonRecord = Record<string, unknown>;

export function normalizeApiError(error: unknown): ApiHttpError {
  if (error instanceof ApiHttpError) {
    return error;
  }

  if (!(error instanceof HttpErrorResponse)) {
    return new ApiHttpError(0, 'An unexpected application error occurred.');
  }

  const body = isRecord(error.error) ? error.error : undefined;
  const validationErrors = normalizeValidationErrors(body?.['errors']);
  const traceId =
    readString(body?.['traceId']) ??
    readString(body?.['trace_id']) ??
    error.headers?.get('x-request-id') ??
    undefined;

  return new ApiHttpError(
    error.status,
    resolveMessage(error, body),
    readString(body?.['code']),
    validationErrors,
    traceId,
  );
}

function resolveMessage(error: HttpErrorResponse, body?: JsonRecord): string {
  if (error.status === 0) {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  const backendMessage =
    readString(body?.['message']) ??
    readString(body?.['title']) ??
    readString(body?.['error']);

  if (backendMessage) {
    return backendMessage;
  }

  switch (error.status) {
    case 400:
      return 'The request could not be processed.';
    case 401:
      return 'Authentication is required to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'The request conflicts with the current state of the resource.';
    case 422:
      return 'One or more values are invalid.';
    default:
      return error.status >= 500
        ? 'The server could not complete the request.'
        : 'The request could not be completed.';
  }
}

function normalizeValidationErrors(value: unknown): readonly ApiValidationError[] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const errors = Object.entries(value)
    .map(([field, messages]) => ({
      field,
      messages: normalizeMessages(messages),
    }))
    .filter((entry) => entry.messages.length > 0);

  return errors.length > 0 ? errors : undefined;
}

function normalizeMessages(value: unknown): readonly string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  return [];
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}
