import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { retry, catchError, throwError } from 'rxjs';
import { DeliveryChallanViewService } from './delivery-challan-view.service';

@Injectable({
  providedIn: 'root',
})
export class LoggedInUserService {
  private storageService = inject(StorageService);
  private loggedInUser = signal('');
  private APPROVER_PERMISSION = 'DC_TXN_APPROVAL_TXN_EDIT';
  private challanService = inject(DeliveryChallanViewService);

  constructor() {
    this.setLoggedInUser();
  }

  getLoggedInUser() {
    return this.loggedInUser;
  }

  private getLoginData() {
    return JSON.parse(this.storageService.getItem('logindata') || '{}');
  }
  setLoggedInUser() {
    const logindata = this.getLoginData();
    this.loggedInUser.set(logindata?.username);
  }

  getPlantsForLoggedInUser() {
    const profiledata = JSON.parse(
      this.storageService.getItem('profile') || '{}'
    );
    const au = profiledata?.mfgUnit?.au;
    const plants = au
      ?.flatMap((item: any) => item?.location)
      ?.flatMap((item: any) => item?.whCode)
      ?.flatMap((item: any) => item?.name);
    const uniquePlants = [...new Set(plants)];

    return uniquePlants;
  }

  getDepartment() {
    const profiledata = JSON.parse(
      this.storageService.getItem('profile') || '{}'
    );

    const department = profiledata?.department[0]?.name;
    return department;
  }

  getUserId() {
    const logindata = this.getLoginData();
    return logindata?.userId;
  }

  isApprover() {
    const profiledata = JSON.parse(
      this.storageService.getItem('profile') || '{}'
    );

    const permissions = Array.from(profiledata?.permissions);

    return permissions?.includes(this.APPROVER_PERMISSION) ? 'True' : 'False';
  }
}
