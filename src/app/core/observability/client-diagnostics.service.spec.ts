import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ApiHttpError } from '../http/api-http-error';
import { ClientDiagnosticEvent } from './client-diagnostic.model';
import { CLIENT_DIAGNOSTIC_SINK } from './client-diagnostic.sink';
import {
  ClientDiagnosticsService,
  shouldReportApiError,
} from './client-diagnostics.service';

describe('ClientDiagnosticsService', () => {
  let events: ClientDiagnosticEvent[];
  let service: ClientDiagnosticsService;

  beforeEach(() => {
    events = [];

    TestBed.configureTestingModule({
      providers: [
        ClientDiagnosticsService,
        {
          provide: CLIENT_DIAGNOSTIC_SINK,
          useValue: (event: ClientDiagnosticEvent) => events.push(event),
        },
      ],
    });

    service = TestBed.inject(ClientDiagnosticsService);
  });

  it('captures an unhandled error without copying its message or payload', () => {
    service.captureUnhandled(new Error('password=do-not-log-this'));

    expect(events).toHaveLength(1);
    expect(events[0].kind).toBe('unhandled-error');
    expect(events[0].errorName).toBe('Error');
    expect(events[0]).not.toHaveProperty('message');
    expect(JSON.stringify(events[0])).not.toContain('do-not-log-this');
  });

  it('captures operational API metadata without backend messages or validation details', () => {
    service.captureApiError(
      new ApiHttpError(
        503,
        'Sensitive upstream response text',
        'SERVICE_UNAVAILABLE',
        [{ field: 'password', messages: ['secret validation text'] }],
        'trace-123',
      ),
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      kind: 'api-error',
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
      traceId: 'trace-123',
    });

    const serialized = JSON.stringify(events[0]);
    expect(serialized).not.toContain('Sensitive upstream response text');
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('secret validation text');
  });

  it('does not report normal client/validation failures', () => {
    service.captureApiError(new ApiHttpError(422, 'Invalid input.'));

    expect(events).toEqual([]);
  });

  it('reports network, throttling, and server failures', () => {
    expect(shouldReportApiError(new ApiHttpError(0, 'Network failure.'))).toBe(true);
    expect(shouldReportApiError(new ApiHttpError(429, 'Rate limited.'))).toBe(true);
    expect(shouldReportApiError(new ApiHttpError(500, 'Server failure.'))).toBe(true);
    expect(shouldReportApiError(new ApiHttpError(404, 'Not found.'))).toBe(false);
  });

  it('drops identifiers that could contain arbitrary sensitive text', () => {
    service.captureApiError(
      new ApiHttpError(
        500,
        'Failure.',
        'code with spaces and secret text',
        undefined,
        'trace/unsafe/value',
      ),
    );

    expect(events[0].code).toBeUndefined();
    expect(events[0].traceId).toBeUndefined();
  });
});
