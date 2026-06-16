import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { BaseService } from './base.service';
import { APIConstant } from '../constants';
import { LookupTypeRequest } from '../models/lookup-type.model';

@Injectable({
  providedIn: 'root',
})
export class LookupTypeService extends CRUDService<LookupTypeRequest> {
  maxCount: number = Number.MAX_VALUE;
  constructor(protected override baseService: BaseService) {
    super(baseService, APIConstant.basePath);
  }

  getLookupsTypes(
    data: any,
    offset: number = 0,
    count: number = this.maxCount
  ) {
    return this.baseService.post(
      APIConstant.basePath + APIConstant.lookupTypes(offset, count),
      data
    );
  }

  getLookupTypeById(id: number) {
    return this.baseService.get(
      APIConstant.basePath + APIConstant.getLookupTypeById(id)
    );
  }

  createLookupTypes(data: object) {
    return this.baseService.post(
      APIConstant.basePath + APIConstant.createLookupType,
      data
    );
  }

  updateLookupTypes(data: object, id: number) {
    return this.baseService.put(
      APIConstant.basePath + APIConstant.updateLookupType(id),
      data
    );
  }
}
