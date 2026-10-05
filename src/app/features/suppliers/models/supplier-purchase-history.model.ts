import { PaginationMeta } from '../../../shared/models/pagination.model';

export type SupplierPurchaseOrderStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'partially-received'
  | 'received'
  | 'cancelled';

export interface SupplierPurchaseHistoryItem {
  readonly id: string;
  readonly number: string;
  readonly orderDate: string;
  readonly expectedDate?: string;
  readonly status: SupplierPurchaseOrderStatus;
  readonly totalAmount: number;
}

export interface SupplierPurchaseHistory {
  readonly data: readonly SupplierPurchaseHistoryItem[];
  readonly pagination: PaginationMeta;
  readonly currencyCode: string;
}
