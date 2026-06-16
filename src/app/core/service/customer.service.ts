import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { BaseService } from './base.service';
import { APIConstant } from '../constants';
import { CustomerRequest } from '../models/customer.model';
@Injectable({
  providedIn: 'root',
})
export class CustomerService extends CRUDService<CustomerRequest> {
  maxCount: number = Number.MAX_VALUE;

  constructor(protected override baseService: BaseService) {
    super(baseService, APIConstant.basePath);
  }

  getCustomers(data: any, offset: number = 0, count: number = this.maxCount) {
    return this.add(APIConstant.getCustomers(offset, count), data);
  }

  getCustomerById(customerId: number) {
    return this.get(APIConstant.getCustomerById(customerId));
  }
}
