import { Injectable } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';

import { ActivatedRoute, Router } from '@angular/router';

import { Observable, of } from 'rxjs';

//import { MessageService } from './message.service';
import {MessageService} from 'primeng/api';

/** Type of the handleError function returned by HttpErrorHandler.createHandleError */
export type HandleError =
  <T> (operation?: string, result?: T) => (error: HttpErrorResponse) => Observable<T>;

/** Handles HttpClient errors */
@Injectable()
export class HttpErrorHandler {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService) { }

  /** Create curried handleError function that already knows the service name */
  createHandleError = (serviceName = '') => <T>
    (operation = 'operation', result = {} as T) => this.handleError(serviceName, operation, result);

  /**
   * Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   * @param serviceName = name of the data service that attempted the operation
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  handleError<T> (serviceName = '', operation = 'operation', result = {} as T) {

    return (error: HttpErrorResponse): Observable<T> => {
      let err = error + "";
      let code:string="500"
      var index = err.indexOf( "status=" ); 
      code = err.substring(index + 7, index + 10);
      if ( code === '500' ){
           this.router.navigate(['error500']);
      } else if ( code === '403' ){
          this.router.navigate(['error403']);
      } else if ( code === '404' ){
          this.router.navigate(['error404']);
      }

      // Let the app keep running by returning a safe result.
      return of( result );
    };

  }
}
