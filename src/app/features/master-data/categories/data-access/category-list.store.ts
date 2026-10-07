import { inject, Injectable } from '@angular/core';

import { MasterDataListStore } from '../../data-access/master-data-list.store';
import { CategoryApiService } from './category-api.service';
import { Category } from '../models/category.model';

@Injectable()
export class CategoryListStore extends MasterDataListStore<Category> {
  constructor() {
    super(inject(CategoryApiService), 'categories');
  }
}
