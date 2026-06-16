import { Injectable } from '@angular/core';
import { DeliveryChallanRequest } from '../models/delivery-challan.model';
import { APIConstant } from '../constants';
import { BaseService } from './base.service';
import { CRUDService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class DeliveryChallanViewService extends CRUDService<DeliveryChallanRequest> {
  maxCount: number = Number.MAX_VALUE;

  constructor(protected override baseService: BaseService) {
    super(baseService, APIConstant.basePath);
  }

  getDeliveryChallans(
    data: any,
    offset: number = 0,
    count: number = this.maxCount
  ) {
    return this.add(APIConstant.getDeliveryChallans(offset, count), data);
  }

  getChallanAudits(data: any, challanNumber: string) {
    return this.get(APIConstant.getAudits(challanNumber), data);
  }

  getUserBlockedFlag(userId: string) {
    return this.get(APIConstant.getUserBlockedFlag(userId));
  }
}
