import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { BaseService } from './base.service';
import { APIConstant } from '../constants';
import { VendorRequest } from '../models/vendor.model';
@Injectable({
  providedIn: 'root',
})
export class VendorService extends CRUDService<VendorRequest> {
  maxCount: number = Number.MAX_VALUE;

  constructor(protected override baseService: BaseService) {
    super(baseService, APIConstant.basePath);
  }

  getVendors(data: any, offset: number = 0, count: number = this.maxCount) {
    return this.add(APIConstant.getVendors(offset, count), data);
  }

  getVendorById(vendorId: number) {
    return this.get(APIConstant.getVendorById(vendorId));
  }
}
