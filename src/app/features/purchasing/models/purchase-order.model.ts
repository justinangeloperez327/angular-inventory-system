export type PurchaseOrderStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'partially-received'
  | 'received'
  | 'cancelled';

export interface PurchaseOrderWarehouseOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface PurchaseOrderSupplierOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface PurchaseOrderProductOption {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly unitSymbol?: string;
  readonly defaultUnitPrice?: number;
}

export interface PurchaseOrderFormOptions {
  readonly warehouses: readonly PurchaseOrderWarehouseOption[];
  readonly currencyCode: string;
}

export interface PurchaseOrderActor {
  readonly id?: string;
  readonly name: string;
}

export interface PurchaseOrderLine {
  readonly id: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly unitSymbol?: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
  readonly quantityReceived: number;
  readonly quantityRemaining: number;
}

export interface PurchaseOrderSummary {
  readonly id: string;
  readonly number: string;
  readonly supplierId: string;
  readonly supplierCode: string;
  readonly supplierName: string;
  readonly warehouseId: string;
  readonly warehouseCode: string;
  readonly warehouseName: string;
  readonly orderDate: string;
  readonly expectedDate?: string;
  readonly status: PurchaseOrderStatus;
  readonly lineCount: number;
  readonly subtotal: number;
  readonly currencyCode: string;
  readonly createdAt: string;
  readonly submittedAt?: string;
  readonly approvedAt?: string;
}

export interface PurchaseOrderDetail extends PurchaseOrderSummary {
  readonly notes?: string;
  readonly lines: readonly PurchaseOrderLine[];
  readonly createdBy?: PurchaseOrderActor;
  readonly submittedBy?: PurchaseOrderActor;
  readonly approvedBy?: PurchaseOrderActor;
}

export interface PurchaseOrderLineRequest {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

export interface PurchaseOrderUpsertRequest {
  readonly supplierId: string;
  readonly warehouseId: string;
  readonly orderDate: string;
  readonly expectedDate?: string;
  readonly notes?: string;
  readonly lines: readonly PurchaseOrderLineRequest[];
}
