export type GoodsReceiptStatus = 'draft' | 'posted' | 'cancelled';

export interface GoodsReceiptWarehouseOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface GoodsReceiptFormOptions {
  readonly warehouses: readonly GoodsReceiptWarehouseOption[];
}

export interface GoodsReceiptPurchaseOrderOption {
  readonly id: string;
  readonly number: string;
  readonly supplierName: string;
  readonly warehouseName: string;
  readonly expectedDate?: string;
}

export interface GoodsReceiptPurchaseOrderLine {
  readonly id: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly unitSymbol?: string;
  readonly quantityOrdered: number;
  readonly quantityReceived: number;
  readonly quantityRemaining: number;
}

export interface GoodsReceiptPurchaseOrderContext {
  readonly id: string;
  readonly number: string;
  readonly supplierId: string;
  readonly supplierCode: string;
  readonly supplierName: string;
  readonly warehouseId: string;
  readonly warehouseCode: string;
  readonly warehouseName: string;
  readonly expectedDate?: string;
  readonly lines: readonly GoodsReceiptPurchaseOrderLine[];
}

export interface GoodsReceiptMovementReference {
  readonly id: string;
  readonly number?: string;
}

export interface GoodsReceiptActor {
  readonly id?: string;
  readonly name: string;
}

export interface GoodsReceiptLine {
  readonly id: string;
  readonly purchaseOrderLineId: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly unitSymbol?: string;
  readonly quantityOrdered: number;
  readonly quantityReceivedBefore: number;
  readonly quantityReceived: number;
  readonly quantityRemainingAfter: number;
  readonly balanceBefore?: number;
  readonly balanceAfter?: number;
  readonly movement?: GoodsReceiptMovementReference;
}

export interface GoodsReceiptSummary {
  readonly id: string;
  readonly number: string;
  readonly purchaseOrderId: string;
  readonly purchaseOrderNumber: string;
  readonly supplierId: string;
  readonly supplierCode: string;
  readonly supplierName: string;
  readonly warehouseId: string;
  readonly warehouseCode: string;
  readonly warehouseName: string;
  readonly receiptDate: string;
  readonly supplierDeliveryReference?: string;
  readonly lineCount: number;
  readonly status: GoodsReceiptStatus;
  readonly createdAt: string;
  readonly postedAt?: string;
}

export interface GoodsReceiptDetail extends GoodsReceiptSummary {
  readonly notes?: string;
  readonly lines: readonly GoodsReceiptLine[];
  readonly createdBy?: GoodsReceiptActor;
  readonly postedBy?: GoodsReceiptActor;
}

export interface GoodsReceiptLineRequest {
  readonly purchaseOrderLineId: string;
  readonly quantityReceived: number;
}

export interface GoodsReceiptUpsertRequest {
  readonly purchaseOrderId: string;
  readonly receiptDate: string;
  readonly supplierDeliveryReference?: string;
  readonly notes?: string;
  readonly lines: readonly GoodsReceiptLineRequest[];
}
