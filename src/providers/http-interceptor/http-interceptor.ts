import { HttpClient, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http/src/interceptor';
import { HttpRequest } from '@angular/common/http/src/request';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class HttpInterceptorProvider implements HttpInterceptor {

  constructor(private storage: Storage) {
    
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    return null;
  }

}
  