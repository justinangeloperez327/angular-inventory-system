import { PaginatedResponse } from '../../../shared/models/pagination.model';

export type InventoryStockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface InventoryBalance {
  readonly id: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly unitName?: string;
  readonly unitSymbol?: string;
  readonly warehouseId: string;
  readonly warehouseCode: string;
  readonly warehouseName: string;
  readonly quantityOnHand: number;
  readonly quantityReserved: number;
  readonly quantityAvailable: number;
  readonly reorderLevel: number;
  readonly status: InventoryStockStatus;
  readonly updatedAt: string;
}

export interface InventoryTotals {
  readonly quantityOnHand: number;
  readonly quantityReserved: number;
  readonly quantityAvailable: number;
  readonly lowStockLines: number;
  readonly outOfStockLines: number;
}

export interface InventoryLookupOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface InventoryFormOptions {
  readonly warehouses: readonly InventoryLookupOption[];
}

export interface InventoryProductHeader {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly unitName?: string;
  readonly unitSymbol?: string;
  readonly reorderLevel: number;
  readonly active: boolean;
}

export interface InventoryWarehouseHeader {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly location?: string;
  readonly active: boolean;
}

export interface ProductInventorySnapshot {
  readonly product: InventoryProductHeader;
  readonly totals: InventoryTotals;
  readonly balances: PaginatedResponse<InventoryBalance>;
}

export interface WarehouseInventorySnapshot {
  readonly warehouse: InventoryWarehouseHeader;
  readonly totals: InventoryTotals;
  readonly balances: PaginatedResponse<InventoryBalance>;
}
