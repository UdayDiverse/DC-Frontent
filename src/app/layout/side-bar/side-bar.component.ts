import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ROUTEPATHS } from '../../core/constants/routes.constants';
import { AuthGuard } from '../../core/guards/auth.guard';

@Component({
  selector: 'side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class SideBarComponent {
  isMasterModule: boolean = true;
  isTransactionModule: boolean = true;
  ROUTES = ROUTEPATHS;

  constructor(
    private router: Router,
    private authGuard: AuthGuard,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  securityGroups(permission: string): boolean {
    //return this.authGuard.securityGroups(permission);
    return true;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMasterModule =
        window.location.pathname.includes('/master/') ||
        window.location.pathname.includes('/master');
      this.isTransactionModule =
        window.location.pathname.includes('/transaction/') ||
        window.location.pathname.includes('/transaction');
    }
  }
}
