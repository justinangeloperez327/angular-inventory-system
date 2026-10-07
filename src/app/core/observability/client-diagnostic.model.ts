export type ClientDiagnosticKind = 'unhandled-error' | 'api-error';
export type ClientDiagnosticSeverity = 'error';

export interface ClientBuildInfo {
  readonly appName: string;
  readonly version: string;
  readonly angularVersion: string;
  readonly commitSha: string;
  readonly buildId: string;
}

export interface ClientDiagnosticEvent {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly kind: ClientDiagnosticKind;
  readonly severity: ClientDiagnosticSeverity;
  readonly build: ClientBuildInfo;
  readonly errorName?: string;
  readonly status?: number;
  readonly code?: string;
  readonly traceId?: string;
}
