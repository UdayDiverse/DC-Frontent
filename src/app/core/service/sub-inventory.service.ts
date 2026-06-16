import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { SubInventoryRequest } from '../models/sub-inventory.model';
import { BaseService } from './base.service';
import { APIConstant } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class SubInventoryService extends CRUDService<SubInventoryRequest> {
  maxCount: number = Number.MAX_VALUE;

  constructor(protected override baseService: BaseService) {
    super(baseService, APIConstant.basePath);
  }

  getSubInventories(
    data: any,
    offset: number = 0,
    count: number = this.maxCount
  ) {
    return this.add(APIConstant.getSubInventories(offset, count), data);
  }

  getSubinventoryById(subinventoryId: number) {
    return this.get(APIConstant.getSubinventoryById(subinventoryId));
  }
}
