import { PaginationMeta, PaginationQuery } from '../../../shared/models/pagination.model';

export type ReportId =
  | 'inventory-balance'
  | 'inventory-valuation'
  | 'stock-movements'
  | 'low-stock'
  | 'out-of-stock'
  | 'purchase-history'
  | 'receiving'
  | 'supplier-purchases'
  | 'adjustments'
  | 'transfers'
  | 'stock-count-variance'
  | 'sales-orders'
  | 'sales-returns';

export type ReportCategory = 'Inventory' | 'Purchasing' | 'Sales';

export type ReportColumnType =
  | 'text'
  | 'integer'
  | 'quantity'
  | 'currency'
  | 'date'
  | 'datetime';

export type ReportFilter =
  | 'search'
  | 'warehouseId'
  | 'movementType'
  | 'dateFrom'
  | 'dateTo';

export interface ReportColumn {
  readonly key: string;
  readonly label: string;
  readonly type?: ReportColumnType;
}

export interface ReportMetric {
  readonly key: string;
  readonly label: string;
  readonly type?: ReportColumnType;
}

export interface ReportDefinition {
  readonly id: ReportId;
  readonly category: ReportCategory;
  readonly title: string;
  readonly description: string;
  readonly searchPlaceholder: string;
  readonly filters: readonly ReportFilter[];
  readonly columns: readonly ReportColumn[];
  readonly metrics: readonly ReportMetric[];
  readonly defaultSort: string;
  readonly defaultDirection: 'asc' | 'desc';
}

export type ReportRow = Readonly<Record<string, string | number | boolean | null | undefined>>;
export type ReportSummary = Readonly<Record<string, string | number | null | undefined>>;

export interface ReportResponse {
  readonly data: readonly ReportRow[];
  readonly pagination: PaginationMeta;
  readonly summary: ReportSummary;
  readonly generatedAt: string;
  readonly currencyCode?: string;
}

export interface ReportLookupOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface ReportValueOption {
  readonly value: string;
  readonly label: string;
}

export interface ReportOptions {
  readonly warehouses: readonly ReportLookupOption[];
  readonly movementTypes: readonly ReportValueOption[];
}

export interface ReportQuery extends PaginationQuery {
  readonly warehouseId?: string;
  readonly movementType?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}
