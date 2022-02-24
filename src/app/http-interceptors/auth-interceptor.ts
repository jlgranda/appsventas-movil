import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JwtService } from '../core/services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private jwtService: JwtService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    console.log("req.url", req.url);
    if (req.url.indexOf('token') > -1
        || req.url.indexOf('auth/login') > -1
        || req.url.indexOf('ping') > -1){
        return next.handle(req);
    } else 
    {
        
        const headersConfig = {
            'Content-Type': 'application/json',
            'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
          };

          const token = this.jwtService.getToken();
          console.log("token", token);
          if (token) {
            headersConfig['Authorization'] = `Bearer ${token}`;
          }

          /*
          * The verbose way:
          // Clone the request and replace the original headers with
          // cloned headers, updated with the authorization.
          const authReq = req.clone({
            headers: req.headers.set('Authorization', authToken)
          });
          */
          
          const request = req.clone({ setHeaders: headersConfig });
          // send cloned request with header to the next handler.
          return next.handle(request);
    }
    
  }
}
