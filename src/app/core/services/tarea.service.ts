import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpErrorHandler, HandleError } from '../../http-error-handler.service';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';

import { ApiService } from './api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from "@angular/common/http";

import { environment } from "src/environments/environment";

const httpOptions = {
    reportProgress: true,
};

@Injectable()
export class TareaService {

    private apiServer = '';
    
    private handleError: HandleError;

    constructor(
        private apiService: ApiService,
        httpErrorHandler: HttpErrorHandler
    ) {
        this.apiServer = this.apiServer = environment.settings.apiServer;
        this.handleError = httpErrorHandler.createHandleError('TareaService');
    }


    listarRaices() {
        return this.apiService.get(this.apiServer + '/tareas/raices')
            .pipe(
                catchError(this.handleError('TareaService.listarRaices'))
            )
    }
}
