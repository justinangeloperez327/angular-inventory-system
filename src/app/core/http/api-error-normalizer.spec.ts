import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { describe, expect, it } from 'vitest';

import { normalizeApiError } from './api-error-normalizer';

describe('normalizeApiError', () => {
  it('normalizes validation errors and trace identifiers', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: {
        message: 'Validation failed.',
        code: 'VALIDATION_ERROR',
        traceId: 'trace-123',
        errors: {
          sku: ['SKU is required.'],
          ignored: [123],
        },
      },
    });

    const normalized = normalizeApiError(error);

    expect(normalized.status).toBe(422);
    expect(normalized.message).toBe('Validation failed.');
    expect(normalized.code).toBe('VALIDATION_ERROR');
    expect(normalized.traceId).toBe('trace-123');
    expect(normalized.validationErrors).toEqual([
      { field: 'sku', messages: ['SKU is required.'] },
    ]);
  });

  it('uses request ID response header as a trace fallback', () => {
    const error = new HttpErrorResponse({
      status: 500,
      headers: new HttpHeaders({ 'x-request-id': 'req-456' }),
    });

    const normalized = normalizeApiError(error);

    expect(normalized.message).toBe('The server could not complete the request.');
    expect(normalized.traceId).toBe('req-456');
  });


  it('uses the outbound request ID when the backend returns no trace identifier', () => {
    const error = new HttpErrorResponse({
      status: 503,
      error: { message: 'Service unavailable.' },
    });

    const normalized = normalizeApiError(error, 'client-request-789');

    expect(normalized.traceId).toBe('client-request-789');
  });

  it('prefers backend trace identifiers over the outbound request ID fallback', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: { traceId: 'backend-trace-123' },
    });

    const normalized = normalizeApiError(error, 'client-request-789');

    expect(normalized.traceId).toBe('backend-trace-123');
  });

  it('normalizes network failures without leaking implementation details', () => {
    const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });

    expect(normalizeApiError(error).message).toBe(
      'Unable to reach the server. Check your connection and try again.',
    );
  });
});
