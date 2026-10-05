export interface DashboardMetrics {
  readonly totalProducts: number;
  readonly totalSkus: number;
  readonly totalWarehouses: number;
  readonly lowStockProducts: number;
  readonly outOfStockProducts: number;
  readonly pendingPurchaseOrders: number;
  readonly pendingReceipts: number;
  readonly inventoryValue: number;
  readonly currencyCode: string;
}

export interface DashboardStockRiskItem {
  readonly id: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly warehouseName: string;
  readonly quantityOnHand: number;
  readonly reorderLevel: number;
  readonly status: 'low' | 'out-of-stock';
}

export interface DashboardPurchaseOrder {
  readonly id: string;
  readonly number: string;
  readonly supplierName: string;
  readonly status: 'draft' | 'submitted' | 'approved' | 'partially-received';
  readonly expectedDate?: string;
}

export interface DashboardReceipt {
  readonly id: string;
  readonly number: string;
  readonly purchaseOrderNumber: string;
  readonly supplierName: string;
  readonly status: 'pending' | 'in-progress';
  readonly expectedDate?: string;
}

export type DashboardMovementType =
  | 'receipt'
  | 'sale'
  | 'transfer-in'
  | 'transfer-out'
  | 'adjustment-in'
  | 'adjustment-out'
  | 'return-in'
  | 'return-out'
  | 'stock-count';

export interface DashboardStockMovement {
  readonly id: string;
  readonly occurredAt: string;
  readonly sku: string;
  readonly productName: string;
  readonly warehouseName: string;
  readonly type: DashboardMovementType;
  readonly quantity: number;
  readonly reference?: string;
}

export interface DashboardSnapshot {
  readonly generatedAt: string;
  readonly metrics: DashboardMetrics;
  readonly stockRisks: readonly DashboardStockRiskItem[];
  readonly pendingPurchaseOrders: readonly DashboardPurchaseOrder[];
  readonly pendingReceipts: readonly DashboardReceipt[];
  readonly recentMovements: readonly DashboardStockMovement[];
}
