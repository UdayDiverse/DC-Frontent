import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { APIConstant } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class BootService {
  constructor(private baseService: BaseService, private router: Router) {}

  load() {
    const time = new Date().getTime();
    return this.baseService
      .get(`/assets/resource.json?ts=${time}`)
      .pipe(tap((res) => this.setEnvironment(res)));
  }

  setEnvironment(res: any) {
    APIConstant.basePath = res.dcAPIURL;
    APIConstant.commonURL = res.commonAPI;
    APIConstant.Ums = res.umsURL;
    APIConstant.Dc = res.dcURL;
  }
}
