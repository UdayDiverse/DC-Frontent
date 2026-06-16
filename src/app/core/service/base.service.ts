import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  plantSpinner: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  vendorSpinner: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  partSpinner: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  lookupSpinner: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  lookupData = new Subject();

  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  getWithHeader<T>(url: string, headers: any): Observable<any> {
    return this.http.get<T>(url, headers);
  }

  getWithResponse<T>(url: string): Observable<any> {
    return this.http.get<T>(url, { observe: 'response' });
  }

  getWithResponseType<T>(url: string, type: string = 'blob'): Observable<any> {
    return this.http.get<T>(url, { responseType: type as 'json' });
  }

  post<T>(url: string, data: any, headers: any = {}): Observable<any> {
    return this.http.post<any>(url, data, headers);
  }

  postWithResponseType<T>(
    url: string,
    data: any,
    type: string = 'blob',
  ): Observable<any> {
    return this.http.post<T>(url, data, { responseType: type as 'json' });
  }

  put<T>(url: string, data: any): Observable<T> {
    return this.http.put<T>(url, data);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
