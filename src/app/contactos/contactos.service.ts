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

    getContactoPorCodeYUsuarioConectado(code: string) {
        return this.apiService.get(this.apiServer + '/contactos/usuario/activos/code/' + code + '')
            .pipe(
                catchError(this.handleError('ContactosService.getContactoPorCodeYUsuarioConectado'))
            );
    }

    getContactosPorUsuarioConectadoYKeyword(keyword: string) {
        return this.apiService.get(this.apiServer + '/contactos/usuario/activos/keyword/' + keyword)
            .pipe(
                catchError(this.handleError('ContactosService.getContactosPorUsuarioConectadoYKeyword'))
            );
    }

    getContacto(contactoId: number) {
        return this.apiService.get(this.apiServer + '/contactos/activos/' + contactoId)
            .pipe(
                catchError(this.handleError('ContactosService.getContacto'))
            );
    }

    enviarContacto(subjectCustomer: SubjectCustomer) {
        return this.apiService.put(this.apiServer + '/contactos', subjectCustomer)
            .pipe(map(data => data['subjectCustomer']));
    }

    getInitialsPorKeyword(keyword: string) {
        return this.apiService.get(this.apiServer + '/contactos/activos/initials/keyword/' + keyword)
            .pipe(
                catchError(this.handleError('ContactosService.getInitialsPorKeyword'))
            );
    }

}
