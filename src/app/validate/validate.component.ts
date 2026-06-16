import { Component, inject, OnInit } from '@angular/core';
import { BaseService } from '../core/service/base.service';
import { LookupService } from '../core/service/lookup.service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIConstant } from '../core/constants';
import { ValidateService } from '../core/service/validate.service';
import { BootService } from '../core/service/boot.service';
import { StorageService } from '../core/service/storage.service';
import { ROUTEPATHS } from '../core/constants/routes.constants';
import { SkeletonComponent } from '../layout/skeleton/skeleton.component';
import { AuthService } from '../core/service/auth.service';
import { LoggedInUserService } from '../core/service/user.service';

@Component({
  templateUrl: './validate.component.html',
  styleUrls: ['validate.component.scss'],
  imports: [SkeletonComponent],
  standalone: true,
})
export class ValidateComponent implements OnInit {
  loadSpinner: boolean = false;
  locations: any;
  validate = 'Validating...';
  storageService = inject(StorageService);
  authService = inject(AuthService);
  userService = inject(LoggedInUserService);

  constructor(
    private bootService: BootService,
    private lookupService: LookupService,
    public baseService: BaseService,
    public validateService: ValidateService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.storageService.clear();
    this.activatedRoute.queryParams.subscribe((params) => {
      const data = params['data'];
      const return_url = params['return_url'];
      if (!data) {
        this.validate = 'Validation Failed';
        return;
      }

      const atobParam: any = atob(data);
      const userData = JSON.parse(atobParam);
      const appSlug = APIConstant.appSlug.toUpperCase();
      const app = userData.apps.find((e: any) =>
        e.name.toUpperCase().includes(appSlug)
      );
      this.validateService
        .generateToken({ appId: app.id }, userData.accessToken)
        .subscribe(async (res) => {
          this.storageService.setItem('logindata', atobParam);
          this.storageService.setItem('profile', JSON.stringify(res));
          this.userService.setLoggedInUser();
          this.authService.loadAuthentication();
          setTimeout(() => {
            if (return_url) {
              window.location.href = return_url;
            } else {
              this.router.navigateByUrl(ROUTEPATHS.MASTERS.HOME);
            }
          }, 500);
        });
    });
  }
}
