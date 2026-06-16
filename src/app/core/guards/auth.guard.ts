import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Router,
} from '@angular/router';
import { AuthService } from '../service/auth.service';
import { APIConstant } from '../constants';
import { CommonUtility } from '../utilities/common';
import { StorageService } from '../service/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  private isBrowser: boolean;
  private storageService = inject(StorageService);
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // get menu(){
  //   const profile:any = localStorage.getItem("profile");
  //   const userData = JSON.parse(profile);
  //   const svcMenu = userData.app.find((e:any)=>e.name=='Manufacture');
  //   //console.log(CommonUtility.flatten(svcMenu.menus))
  //   return CommonUtility.flatten(svcMenu.menus);
  // }

  // securityGroups(permission:String){
  //   if(this.menu.find((e:any)=>e.key===permission)){
  //     return true;
  //   }
  //   return true;
  // }

  get menu() {
    const profile: any = this.storageService.getItem('profile');
    const userData = JSON.parse(profile);
    const gtmMenu = userData.app;
    if (!gtmMenu) {
      return [];
    }
    return CommonUtility.flatten(gtmMenu.menus);
  }

  securityGroups(permission: string): boolean {
    const profile: any = this.storageService.getItem('profile');
    const userData = JSON.parse(profile);
    const permissions = userData?.permissions || [];
    return permissions.includes(permission);
  }

  canActivate(): boolean {
    return this.checkAuth();
  }

  canActivateChild(): boolean {
    return this.checkAuth();
  }

  canDeactivate(component: any): boolean {
    if (isPlatformBrowser(this.platformId) && component.hasUnsavedChanges()) {
      return window.confirm(
        'You have unsaved changes. Do you really want to leave?'
      );
    }
    return true;
  }

  canLoad(): boolean {
    return this.checkAuth();
  }

  private checkAuth(): boolean {
    if (this.authService.isAuthenticatedUser()) {
      return true;
    } else {
      // Redirect to the login page if the user is not authenticated
      //this.router.navigate(['/login']);
      if (isPlatformBrowser(this.platformId)) {
        window.location.href = APIConstant.Ums + `/auth/login`;
      }
      return false;
    }
  }
}
