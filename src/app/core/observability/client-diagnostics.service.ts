import { inject, Injectable } from '@angular/core';

import { ApiHttpError } from '../http/api-http-error';
import { GENERATED_BUILD_INFO } from './build-info.generated';
import { ClientDiagnosticEvent } from './client-diagnostic.model';
import { CLIENT_DIAGNOSTIC_SINK } from './client-diagnostic.sink';

@Injectable({ providedIn: 'root' })
export class ClientDiagnosticsService {
  private readonly sink = inject(CLIENT_DIAGNOSTIC_SINK);

  captureUnhandled(error: unknown): void {
    this.sink({
      eventId: createDiagnosticId(),
      occurredAt: new Date().toISOString(),
      kind: 'unhandled-error',
      severity: 'error',
      build: GENERATED_BUILD_INFO,
      errorName: readErrorName(error),
    });
  }

  captureApiError(error: ApiHttpError): void {
    if (!shouldReportApiError(error)) {
      return;
    }

    this.sink({
      eventId: createDiagnosticId(),
      occurredAt: new Date().toISOString(),
      kind: 'api-error',
      severity: 'error',
      build: GENERATED_BUILD_INFO,
      status: error.status,
      code: sanitizeIdentifier(error.code),
      traceId: sanitizeIdentifier(error.traceId),
    });
  }
}

export function shouldReportApiError(error: ApiHttpError): boolean {
  return error.status === 0 || error.status === 429 || error.status >= 500;
}

function createDiagnosticId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `diag-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readErrorName(error: unknown): string | undefined {
  if (error instanceof Error) {
    return sanitizeIdentifier(error.name);
  }

  return undefined;
}

function sanitizeIdentifier(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function createDiagnosticSnapshot(
  event: ClientDiagnosticEvent,
): ClientDiagnosticEvent {
  return {
    ...event,
    build: { ...event.build },
  };
}
