import { inject, Injectable } from '@angular/core';

import { MasterDataListStore } from '../../data-access/master-data-list.store';
import { UnitApiService } from './unit-api.service';
import { Unit } from '../models/unit.model';

@Injectable()
export class UnitListStore extends MasterDataListStore<Unit> {
  constructor() {
    super(inject(UnitApiService), 'units');
  }
}
