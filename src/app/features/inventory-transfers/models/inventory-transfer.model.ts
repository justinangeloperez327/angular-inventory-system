export type InventoryTransferStatus = 'draft' | 'posted' | 'cancelled';

export interface InventoryTransferWarehouseOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface InventoryTransferProductOption {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly unitSymbol?: string;
  readonly quantityAvailable: number;
}

export interface InventoryTransferFormOptions {
  readonly warehouses: readonly InventoryTransferWarehouseOption[];
}

export interface InventoryTransferMovementReference {
  readonly id: string;
  readonly number?: string;
}

export interface InventoryTransferActor {
  readonly id?: string;
  readonly name: string;
}

export interface InventoryTransferLine {
  readonly id: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly unitSymbol?: string;
  readonly quantity: number;
  readonly sourceBalanceBefore?: number;
  readonly sourceBalanceAfter?: number;
  readonly destinationBalanceBefore?: number;
  readonly destinationBalanceAfter?: number;
  readonly outboundMovement?: InventoryTransferMovementReference;
  readonly inboundMovement?: InventoryTransferMovementReference;
}

export interface InventoryTransferSummary {
  readonly id: string;
  readonly number: string;
  readonly sourceWarehouseId: string;
  readonly sourceWarehouseCode: string;
  readonly sourceWarehouseName: string;
  readonly destinationWarehouseId: string;
  readonly destinationWarehouseCode: string;
  readonly destinationWarehouseName: string;
  readonly lineCount: number;
  readonly status: InventoryTransferStatus;
  readonly createdAt: string;
  readonly postedAt?: string;
}

export interface InventoryTransferDetail extends InventoryTransferSummary {
  readonly notes?: string;
  readonly lines: readonly InventoryTransferLine[];
  readonly createdBy?: InventoryTransferActor;
  readonly postedBy?: InventoryTransferActor;
}

export interface InventoryTransferLineRequest {
  readonly productId: string;
  readonly quantity: number;
}

export interface InventoryTransferUpsertRequest {
  readonly sourceWarehouseId: string;
  readonly destinationWarehouseId: string;
  readonly notes?: string;
  readonly lines: readonly InventoryTransferLineRequest[];
}
