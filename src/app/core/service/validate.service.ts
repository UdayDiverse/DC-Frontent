import { Injectable } from "@angular/core";
import { CRUDService } from "./crud.service";
import { BaseService } from "./base.service";
import { APIConstant } from "../constants";
import { map, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: "root",
})
export class ValidateService extends CRUDService<any> {
    constructor(protected override baseService: BaseService) {
        super(baseService, APIConstant.basePath);
    }

    generateToken(data: any, accessToken: string) {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${accessToken}`);
        return this.baseService.getWithHeader(APIConstant.commonURL + APIConstant.generateToken(data.appId), {headers:headers});
    }
}
