import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../service/storage.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const storageService = inject(StorageService);
  const tokenData = storageService.getItem('profile');
  if (tokenData) {
    req = req.clone({
      headers: req.headers.set(
        'Authorization',
        `Bearer ${JSON.parse(tokenData).accessToken}`
      ),
    });
  }

  return next(req);
};
