import { inject, Injectable } from '@angular/core';

import { MasterDataListStore } from '../../data-access/master-data-list.store';
import { WarehouseApiService } from './warehouse-api.service';
import { Warehouse } from '../models/warehouse.model';

@Injectable()
export class WarehouseListStore extends MasterDataListStore<Warehouse> {
  constructor() {
    super(inject(WarehouseApiService), 'warehouses');
  }
}
