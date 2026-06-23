import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { APIConstant } from '../constants';
import { CRUDService } from './crud.service';
import { ReportsRequest } from '../models/reports.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsServiceService extends CRUDService<ReportsRequest> {
  maxCount: number = Number.MAX_VALUE;

  constructor(protected override baseService: BaseService) {
    super(baseService, APIConstant.basePath);
  }

  getAgeingReports(
    data: any,
    offset: number = 0,
    count: number = this.maxCount
  ) {
    return this.add(APIConstant.getAgeingReports(offset, count), data);
  }

  getErrorLoggingReports(
    data: any,
    offset: number = 0,
    count: number = this.maxCount
  ) {
    return this.add(APIConstant.getErrorLoggingReports(offset, count), data);
  }

  getEmailReports(
    data: any,
    offset: number = 0,
    count: number = this.maxCount
  ) {
    return this.add(APIConstant.getEmailReports(offset, count), data);
  }

  getfreightOutBoundReports(
    data: any,
    offset: number = 0,
    count: number = this.maxCount
  ) {
    return this.add(APIConstant.getfreightOutBoundReports(offset, count), data);
  }

   getGateOutReports(
    data: any,
    offset: number = 0,
    count: number = this.maxCount
  ) {
    return this.add(APIConstant.getGateOutReports(offset, count), data);
  }
}
