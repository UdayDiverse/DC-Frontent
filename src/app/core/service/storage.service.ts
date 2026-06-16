import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getItem(key: string) {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  setItem(key: string, value: any) {
    if (this.isBrowser) localStorage.setItem(key, value);
  }

  removeItem(key: string) {
    if (this.isBrowser) localStorage.removeItem(key);
  }

  clear() {
    if (this.isBrowser) localStorage.clear();
  }
}
