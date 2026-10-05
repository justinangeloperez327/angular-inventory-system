export interface ProductSummary {
  readonly id: string;
  readonly sku: string;
  readonly barcode?: string;
  readonly name: string;
  readonly categoryId?: string;
  readonly categoryName?: string;
  readonly unitId?: string;
  readonly unitName?: string;
  readonly costPrice: number;
  readonly sellingPrice: number;
  readonly reorderLevel: number;
  readonly active: boolean;
  readonly updatedAt: string;
}

export interface ProductDetail extends ProductSummary {
  readonly description?: string;
  readonly currencyCode: string;
  readonly createdAt: string;
}

export interface ProductUpsertRequest {
  readonly sku: string;
  readonly barcode?: string;
  readonly name: string;
  readonly description?: string;
  readonly categoryId?: string;
  readonly unitId?: string;
  readonly costPrice: number;
  readonly sellingPrice: number;
  readonly reorderLevel: number;
}

export interface ProductStatusRequest {
  readonly active: boolean;
}

export interface ProductOption {
  readonly id: string;
  readonly name: string;
}

export interface ProductFormOptions {
  readonly categories: readonly ProductOption[];
  readonly units: readonly ProductOption[];
  readonly currencyCode: string;
}
