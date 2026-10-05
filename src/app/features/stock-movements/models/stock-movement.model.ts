export type StockMovementType =
  | 'receipt'
  | 'sale'
  | 'transfer-in'
  | 'transfer-out'
  | 'adjustment-in'
  | 'adjustment-out'
  | 'return-in'
  | 'return-out'
  | 'stock-count';

export interface StockMovementReference {
  readonly type: string;
  readonly id: string;
  readonly number: string;
  readonly referencePath?: string;
}

export interface StockMovementActor {
  readonly id?: string;
  readonly name: string;
}

export interface StockMovementSummary {
  readonly id: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly unitSymbol?: string;
  readonly warehouseId: string;
  readonly warehouseCode: string;
  readonly warehouseName: string;
  readonly type: StockMovementType;
  readonly quantityChange: number;
  readonly balanceAfter?: number;
  readonly reference?: StockMovementReference;
  readonly occurredAt: string;
  readonly performedBy?: StockMovementActor;
}

export interface StockMovementDetail extends StockMovementSummary {
  readonly notes?: string;
  readonly createdAt: string;
}

export interface StockMovementLookupOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface StockMovementFormOptions {
  readonly warehouses: readonly StockMovementLookupOption[];
}
