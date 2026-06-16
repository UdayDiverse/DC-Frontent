import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { BaseService } from './base.service';
import { APIConstant } from '../constants';
import { VendorRequest } from '../models/vendor.model';
import { DeliveryChallanRequest } from '../models/delivery-challan.model';
@Injectable({
  providedIn: 'root',
})
export class DeliveryChallanService extends CRUDService<DeliveryChallanRequest> {
  maxCount: number = Number.MAX_VALUE;

  constructor(protected override baseService: BaseService) {
    super(baseService, APIConstant.basePath);
  }

  createDeliveryChallan(payload: any) {
    return this.add(APIConstant.createDeliveryChallan, payload);
  }
  updateDeliveryChallan(payload: any, challanNumber: string) {
    return this.update(
      APIConstant.updateDeliveryChallan(challanNumber),
      payload,
    );
  }

  getChallanByChallanNumber(challanNumber: string) {
    return this.get(APIConstant.getChallanByChallanNumber(challanNumber));
  }

  getChallanPrintDetails(challanNumber: string, payload: any) {
    return this.add(APIConstant.getChallanPrintDetails(challanNumber), payload);
  }

  getAttachments(challanId: number) {
    return this.get(APIConstant.getAttachments(challanId));
  }

  deliveryChallanApproval(payload: any, challanNumber: string) {
    return this.update(
      APIConstant.deliveryChallanApproval(challanNumber),
      payload,
    );
  }

  createEwaybillManually(payload: any, challanNumber: string) {
    return this.add(APIConstant.createEwaybillManually(challanNumber), payload);
  }
  updateEwaybillManually(payload: any, challanNumber: string) {
    return this.update(
      APIConstant.updateEwaybillManually(challanNumber),
      payload,
    );
  }

  printEwayBill(challanNumber: string) {
    return this.get(APIConstant.printEwayBill(challanNumber));
  }

  extendDueDate(payload: any, challaNumber: string) {
    return this.update(APIConstant.extendDueDate(challaNumber), payload);
  }

  generateEwayBillViaApi(payload: any) {
    return this.add(APIConstant.generateEwayBillViaApi, payload);
  }

  cancelEwayBillViaApi(payload: any) {
    return this.add(APIConstant.cancelEwayBillViaApi, payload);
  }
}
