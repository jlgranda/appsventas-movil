import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';
import { SubjectCustomer } from '../modelo/SubjectCustomer';

@Injectable({
    providedIn: 'root'
})
export class ContactosService {

    private apiServer = '';
    private handleError: HandleError;

    constructor(
        private apiService: ApiService,
        private httpErrorHandler: HttpErrorHandler,
    ) {
        this.apiServer = environment.settings.apiServer;
        this.handleError = httpErrorHandler.createHandleError('ContactosService');
    }

    getContactosPorKeyword(keyword: string) {
        return this.apiService.get(this.apiServer + '/contactos/activos/keyword/' + keyword)
        .pipe(
            catchError(this.handleError('ContactosService.getContactosPorKeyword'))
        );
    }
    
    getContactosPorUsuarioConectado() {
        return this.apiService.get(this.apiServer + '/contactos/usuario/activos')
        .pipe(
            catchError(this.handleError('ContactosService.getContactosPorUsuarioConectado'))
        );
    }

    getContactosPorUsuarioConectadoYKeyword(keyword: string) {
        return this.apiService.get(this.apiServer + '/contactos/usuario/activos/keyword/' + keyword)
        .pipe(
            catchError(this.handleError('ContactosService.getContactosPorUsuarioConectadoYKeyword'))
        );
    }
    
    enviarContacto(subjectCustomer: SubjectCustomer) {
//        if (subjectCustomer.id && subjectCustomer.customerId) {
//            return this.apiService.put(this.apiServer + '/contactos', subjectCustomer)
//                .pipe(map(data => data['subjectCustomer']));
//        } else {
            return this.apiService.post(this.apiServer + '/contactos', subjectCustomer)
                .pipe(map(data => data['subjectCustomer']));
//        }
    }
    
    getInitialsPorKeyword(keyword: string) {
        return this.apiService.get(this.apiServer + '/contactos/activos/initials/keyword/' + keyword)
        .pipe(
            catchError(this.handleError('ContactosService.getInitialsPorKeyword'))
        );
    }

}
