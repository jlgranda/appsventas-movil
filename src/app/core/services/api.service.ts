import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable ,  throwError } from 'rxjs';

import { JwtService } from './jwt.service';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ApiService {
  constructor(
    private http: HttpClient,
    private jwtService: JwtService
  ) {}

  private formatErrors(error: any) {
    return  throwError(error.error);
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${path}`, { params })
      .pipe(catchError(this.formatErrors));

  }
  
  put(path: string, body: Object = {}): Observable<any> {
    return this.http.put(
      `${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.http.post(
      `${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  delete(path): Observable<any> {
    return this.http.delete(
      `${path}`
    ).pipe(catchError(this.formatErrors));
  }

  downloadFile(path, params: HttpParams = new HttpParams()): Observable<any>{  
      return this.http.get(`${path}`, { params, responseType: 'blob' })
          .pipe(catchError(this.formatErrors));;
  }
  
  downloadFileFromPost(path, body: Object = {}, params: HttpParams = new HttpParams()): Observable<any>{  
      return this.http.post(`${path}`,
        JSON.stringify(body), { params, responseType: 'blob' })
          .pipe(catchError(this.formatErrors));;
  }

}
