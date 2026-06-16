import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { APIConstant } from '../constants';
import { CRUDService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class GateOutService extends CRUDService<any> {
  maxCount: number = Number.MAX_VALUE;

  constructor(protected override baseService: BaseService) {
    super(baseService, APIConstant.basePath);
  }
  getControlOutgoing(
    data: any,
    offset: number = 0,
    count: number = this.maxCount
  ) {
    return this.add(APIConstant.getControlOutgoing(offset, count), data);
  }
  updateControlOutgoing(id: number, data: any) {
    return this.update(APIConstant.updateControlOutgoing(id), data);
  }
  dcControlOutgoing(challanNumber: string, data: any) {
    return this.update(APIConstant.dcControlOutgoing(challanNumber), data);
  }

  bulkStatusUpdate(data: any) {
    return this.update(APIConstant.bulkStatusUpdate, data);
  }
  getGateIns(challanNumber: string) {
    return this.get(APIConstant.getGateIns(challanNumber));
  }
  createGateIn(data: any) {
    return this.add(APIConstant.createGateIn, data);
  }

  getGateOutFilters(data: any) {
    return this.add(APIConstant.getGateOutFilters, data);
  }
}
