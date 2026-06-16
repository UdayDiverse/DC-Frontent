import { isPlatformBrowser } from '@angular/common';
import { inject, Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { APIConstant } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = signal(false);
  private authSecretKey = 'profile';
  private storageService = inject(StorageService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadAuthentication();
  }

  loadAuthentication() {
    if (isPlatformBrowser(this.platformId)) {
      this.isAuthenticated.set(
        !!this.storageService.getItem(this.authSecretKey)
      );
    }
  }

  login(): boolean {
    if (this.storageService.getItem(this.authSecretKey)) {
      this.isAuthenticated.set(true);
      return true;
    } else {
      return false;
    }
  }

  isAuthenticatedUser(): boolean {
    return this.isAuthenticated();
  }

  logout(): void {
    this.storageService.removeItem(this.authSecretKey);
    this.isAuthenticated.set(false);
    localStorage.clear();
    window.location.href = APIConstant.Ums + `/auth/login`;
  }
}
