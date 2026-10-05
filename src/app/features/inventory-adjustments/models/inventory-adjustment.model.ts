export type InventoryAdjustmentDirection = 'increase' | 'decrease';
export type InventoryAdjustmentStatus = 'draft' | 'posted' | 'cancelled';

export interface InventoryAdjustmentReason {
  readonly code: string;
  readonly label: string;
  readonly direction?: InventoryAdjustmentDirection;
}

export interface InventoryAdjustmentLookupOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface InventoryAdjustmentProductOption {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly unitSymbol?: string;
}

export interface InventoryAdjustmentFormOptions {
  readonly warehouses: readonly InventoryAdjustmentLookupOption[];
  readonly reasons: readonly InventoryAdjustmentReason[];
}

export interface InventoryAdjustmentSummary {
  readonly id: string;
  readonly number: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly unitSymbol?: string;
  readonly warehouseId: string;
  readonly warehouseCode: string;
  readonly warehouseName: string;
  readonly direction: InventoryAdjustmentDirection;
  readonly quantity: number;
  readonly reasonCode: string;
  readonly reasonLabel: string;
  readonly status: InventoryAdjustmentStatus;
  readonly createdAt: string;
  readonly postedAt?: string;
}

export interface InventoryAdjustmentActor {
  readonly id?: string;
  readonly name: string;
}

export interface InventoryAdjustmentMovementReference {
  readonly id: string;
  readonly number?: string;
}

export interface InventoryAdjustmentDetail extends InventoryAdjustmentSummary {
  readonly notes?: string;
  readonly balanceBefore?: number;
  readonly balanceAfter?: number;
  readonly createdBy?: InventoryAdjustmentActor;
  readonly postedBy?: InventoryAdjustmentActor;
  readonly movement?: InventoryAdjustmentMovementReference;
}

export interface InventoryAdjustmentUpsertRequest {
  readonly productId: string;
  readonly warehouseId: string;
  readonly direction: InventoryAdjustmentDirection;
  readonly quantity: number;
  readonly reasonCode: string;
  readonly notes?: string;
}
