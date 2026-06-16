import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { BaseService } from './base.service';
import { APIConstant } from '../constants';
import { TransporterRequest } from '../models/transporter.model';
@Injectable({
  providedIn: 'root',
})
export class TransporterService extends CRUDService<TransporterRequest> {
  maxCount: number = Number.MAX_VALUE;

  constructor(protected override baseService: BaseService) {
    super(baseService, APIConstant.basePath);
  }

  getTransporters(
    data: any,
    offset: number = 0,
    count: number = this.maxCount
  ) {
    return this.add(APIConstant.getTransporters(offset, count), data);
  }

  getTransporterById(transporterId: number) {
    return this.get(APIConstant.getTransporterById(transporterId));
  }
}
