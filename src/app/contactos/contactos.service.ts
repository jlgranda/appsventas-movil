import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';

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
        console.log("getContactosPorKeyword");
        return this.apiService.get(this.apiServer + '/contactos/activos/keyword/' + keyword).pipe(
            catchError(this.handleError('ContactosService.getContactosPorKeyword'))
        );
    }
    
    getContactosPorUsuarioConectado() {
        console.log("getContactosPorUsuarioConectado");
        return this.apiService.get(this.apiServer + '/contactos/usuario/activos').pipe(
            catchError(this.handleError('ContactosService.getContactosPorUsuarioConectado'))
        );
    }

    getContactosPorUsuarioConectadoYKeyword(keyword: string) {
        console.log("getContactosPorUsuarioConectadoYKeyword");
        return this.apiService.get(this.apiServer + '/contactos/usuario/activos/keyword/' + keyword).pipe(
            catchError(this.handleError('ContactosService.getContactosPorUsuarioConectadoYKeyword'))
        );
    }

}
