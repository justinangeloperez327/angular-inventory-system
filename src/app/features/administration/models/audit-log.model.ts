import { PaginationQuery } from '../../../shared/models/pagination.model';

export interface AuditActor {
  readonly id?: string;
  readonly name: string;
  readonly email?: string;
}

export interface AuditLogEntry {
  readonly id: string;
  readonly occurredAt: string;
  readonly actor?: AuditActor;
  readonly action: string;
  readonly area: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly entityLabel?: string;
  readonly summary: string;
}

export interface AuditLogQuery extends PaginationQuery {
  readonly area?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

export interface AuditLogFilters {
  readonly search: string;
  readonly area: string;
  readonly dateFrom: string;
  readonly dateTo: string;
}

export interface AuditLogOptions {
  readonly areas: readonly string[];
}
