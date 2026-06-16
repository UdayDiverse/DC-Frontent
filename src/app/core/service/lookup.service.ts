import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { BaseService } from './base.service';
import { APIConstant } from '../constants';
import { LookupRequest } from '../models/lookup.model';
@Injectable({
  providedIn: 'root',
})
export class LookupService extends CRUDService<LookupRequest> {
  maxCount: number = Number.MAX_VALUE;

  constructor(protected override baseService: BaseService) {
    super(baseService, APIConstant.basePath);
  }

  getLookups(data: any, offset: number = 0, count: number = this.maxCount) {
    return this.add(APIConstant.lookups(offset, count), data);
  }

  getLookupSearchByType(code: any) {
    return this.get(APIConstant.getLookupsByType(code));
  }

  getLookupById(lookupId: number) {
    return this.get(APIConstant.getLookupById(lookupId));
  }

  updateLookup(lookupId: number, data: object) {
    return this.update(APIConstant.updateLookup(lookupId), data);
  }

  createLookup(data: object) {
    return this.add(APIConstant.createLookup, data);
  }
}
