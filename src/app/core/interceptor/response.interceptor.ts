import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { APIConstant } from '../constants';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PlatformService } from '../service/platform.service';

export const responseInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const toastr = inject(ToastrService);
  const platformService = inject(PlatformService);

  function handleError(error: any) {
    if (error?.error?.details) {
      return error?.error?.details
        ?.map((detail: any) => detail.description)
        .join('<br>');
    } else if (error.status === 403) {
      return 'Permission Denied';
    } else {
      return 'Something went wrong';
    }
  }

  return next(req).pipe(
    catchError((err: any) => {
      if (platformService.isPlatformBrowser()) {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            window.location.href = `${APIConstant.Ums}/auth/login?return_url=${window.location.href}`;
          }
        } else {
          // toastr.error(handleError(err));
        }
      }
      return throwError(err);
    })
  );
};
