export type SalesOrderStatus =
  | 'draft'
  | 'confirmed'
  | 'dispatched'
  | 'completed'
  | 'cancelled';

export interface SalesOrderWarehouseOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface SalesOrderCustomerOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface SalesOrderProductOption {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly unitSymbol?: string;
  readonly quantityAvailable: number;
  readonly defaultUnitPrice?: number;
}

export interface SalesOrderFormOptions {
  readonly warehouses: readonly SalesOrderWarehouseOption[];
  readonly currencyCode: string;
}

export interface SalesOrderActor {
  readonly id?: string;
  readonly name: string;
}

export interface SalesOrderMovementReference {
  readonly id: string;
  readonly number?: string;
}

export interface SalesOrderLine {
  readonly id: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly unitSymbol?: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
  readonly quantityReserved: number;
  readonly quantityDispatched: number;
  readonly quantityReturned: number;
  readonly saleMovement?: SalesOrderMovementReference;
}

export interface SalesReturnLine {
  readonly id: string;
  readonly salesOrderLineId: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly unitSymbol?: string;
  readonly quantityReturned: number;
  readonly movement?: SalesOrderMovementReference;
}

export interface SalesReturnSummary {
  readonly id: string;
  readonly number: string;
  readonly createdAt: string;
  readonly createdBy?: SalesOrderActor;
  readonly lines: readonly SalesReturnLine[];
}

export interface SalesOrderSummary {
  readonly id: string;
  readonly number: string;
  readonly customerId: string;
  readonly customerCode: string;
  readonly customerName: string;
  readonly warehouseId: string;
  readonly warehouseCode: string;
  readonly warehouseName: string;
  readonly orderDate: string;
  readonly status: SalesOrderStatus;
  readonly lineCount: number;
  readonly subtotal: number;
  readonly currencyCode: string;
  readonly createdAt: string;
  readonly confirmedAt?: string;
  readonly dispatchedAt?: string;
  readonly completedAt?: string;
}

export interface SalesOrderDetail extends SalesOrderSummary {
  readonly notes?: string;
  readonly lines: readonly SalesOrderLine[];
  readonly returns: readonly SalesReturnSummary[];
  readonly createdBy?: SalesOrderActor;
  readonly confirmedBy?: SalesOrderActor;
  readonly dispatchedBy?: SalesOrderActor;
  readonly completedBy?: SalesOrderActor;
}

export interface SalesOrderLineRequest {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

export interface SalesOrderUpsertRequest {
  readonly customerId: string;
  readonly warehouseId: string;
  readonly orderDate: string;
  readonly notes?: string;
  readonly lines: readonly SalesOrderLineRequest[];
}

export interface SalesReturnLineRequest {
  readonly salesOrderLineId: string;
  readonly quantity: number;
}

export interface SalesReturnRequest {
  readonly notes?: string;
  readonly lines: readonly SalesReturnLineRequest[];
}
