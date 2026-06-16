import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpInterceptor,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConstant } from '../constants';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ResponseInterceptor implements HttpInterceptor {
  constructor(private toastr: ToastrService) {}

  handleError(error: any) {
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

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          console.log(err);
          if (err.status === 401) {
            window.location.href = `${APIConstant.Ums}/auth/login?return_url=${window.location.href}`;
          } else {
            this.toastr.error(this.handleError(err));
          }
        }
        return throwError(err);
      })
    );
  }
}
