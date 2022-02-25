import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class ServiciosService {

    private apiServer = '';
    private handleError: HandleError;

    constructor(
        private apiService: ApiService,
        private httpErrorHandler: HttpErrorHandler,
    ) {
        this.apiServer = environment.settings.apiServer;
        this.handleError = httpErrorHandler.createHandleError('ServiciosService');
    }

    getProductosPorOrganizacionDeUsuarioConectado() {
        console.log("-------------------------------------------------");
        console.log("getProductosPorOrganizacionDeUsuarioConectado");
        console.log("-------------------------------------------------");
        return this.apiService.get(this.apiServer + '/servicios/organizacion/activos').pipe(
            catchError(this.handleError('ServiciosService.getProductosPorOrganizacionDeUsuarioConectado'))
        );
    }

    getProductosPorTipoYOrganizacionDeUsuarioConectado(productType: any) {
        console.log("-------------------------------------------------");
        console.log("getProductosPorTipoYOrganizacionDeUsuarioConectado");
        console.log("-------------------------------------------------");
        return this.apiService.get(this.apiServer + '/servicios/organizacion/tipo/' + productType + '/activos').pipe(
            catchError(this.handleError('ServiciosService.getProductosPorTipoYOrganizacionDeUsuarioConectado'))
        );
    }


}
