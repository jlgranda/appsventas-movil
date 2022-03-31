import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private apiServer = '';
    private handleError: HandleError;

    constructor(
        private apiService: ApiService, httpErrorHandler: HttpErrorHandler
    ) {
        this.apiServer = environment.settings.apiServer;
        this.handleError = httpErrorHandler.createHandleError('DataService');
    }
    
    
    getInstitucionesFinancierasData() {
        return this.apiService.get('assets/data/instituciones-financieras.json')
            .toPromise()
            .then(res => res.data as any[])
            .then(data => data);
    }
    
}
