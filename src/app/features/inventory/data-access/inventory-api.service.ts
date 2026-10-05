import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api-client.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  InventoryBalance,
  InventoryFormOptions,
  ProductInventorySnapshot,
  WarehouseInventorySnapshot,
} from '../models/inventory.model';
import { InventoryBalanceQuery } from '../models/inventory-query.model';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly api = inject(ApiClient);

  listBalances(query: InventoryBalanceQuery): Observable<PaginatedResponse<InventoryBalance>> {
    return this.api.get<PaginatedResponse<InventoryBalance>>('inventory/balances', {
      params: query,
    });
  }

  getFormOptions(): Observable<InventoryFormOptions> {
    return this.api.get<InventoryFormOptions>('inventory/form-options');
  }

  getProductInventory(
    productId: string,
    page = 1,
    pageSize = 25,
  ): Observable<ProductInventorySnapshot> {
    return this.api.get<ProductInventorySnapshot>(
      `inventory/products/${encodeURIComponent(productId)}`,
      { params: { page, pageSize } },
    );
  }

  getWarehouseInventory(
    warehouseId: string,
    page = 1,
    pageSize = 25,
  ): Observable<WarehouseInventorySnapshot> {
    return this.api.get<WarehouseInventorySnapshot>(
      `inventory/warehouses/${encodeURIComponent(warehouseId)}`,
      { params: { page, pageSize } },
    );
  }
}
