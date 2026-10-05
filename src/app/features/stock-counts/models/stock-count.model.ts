import { PaginatedResponse } from '../../../shared/models/pagination.model';

export type StockCountStatus = 'draft' | 'counting' | 'submitted' | 'posted' | 'cancelled';

export interface StockCountWarehouseOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface StockCountFormOptions {
  readonly warehouses: readonly StockCountWarehouseOption[];
}

export interface StockCountActor {
  readonly id?: string;
  readonly name: string;
}

export interface StockCountMovementReference {
  readonly id: string;
  readonly number?: string;
}

export interface StockCountLine {
  readonly id: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly unitSymbol?: string;
  readonly expectedQuantity: number;
  readonly countedQuantity: number | null;
  readonly varianceQuantity: number | null;
  readonly movement?: StockCountMovementReference;
}

export interface StockCountSummary {
  readonly id: string;
  readonly number: string;
  readonly warehouseId: string;
  readonly warehouseCode: string;
  readonly warehouseName: string;
  readonly status: StockCountStatus;
  readonly lineCount: number;
  readonly countedLineCount: number;
  readonly varianceLineCount: number;
  readonly createdAt: string;
  readonly startedAt?: string;
  readonly submittedAt?: string;
  readonly postedAt?: string;
}

export interface StockCountDetail extends StockCountSummary {
  readonly notes?: string;
  readonly createdBy?: StockCountActor;
  readonly startedBy?: StockCountActor;
  readonly submittedBy?: StockCountActor;
  readonly approvedBy?: StockCountActor;
  readonly approvedAt?: string;
}

export interface StockCountSnapshot {
  readonly count: StockCountDetail;
  readonly lines: PaginatedResponse<StockCountLine>;
}

export interface StockCountCreateRequest {
  readonly warehouseId: string;
  readonly notes?: string;
}

export interface StockCountLineUpdate {
  readonly lineId: string;
  readonly countedQuantity: number;
}

export interface StockCountLineUpdateRequest {
  readonly lines: readonly StockCountLineUpdate[];
}
