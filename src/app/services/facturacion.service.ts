import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class FacturacionService {

    private apiServer = '';
    private handleError: HandleError;

    constructor(
        private apiService: ApiService, httpErrorHandler: HttpErrorHandler
    ) {
        this.apiServer = environment.settings.apiServer;
        this.handleError = httpErrorHandler.createHandleError('FacturacionService');
    }

    getInvoicesPorUsuarioConectado() {
        console.log("-------------------------------------------------");
        console.log("getInvoicesPorUsuarioConectado");
        console.log("-------------------------------------------------");
        return this.apiService.get(this.apiServer + '/app/usuario/facturas')
            .pipe(
                catchError(this.handleError('FacturacionService.getFacturasPorUsuario'))
            )
    }

}
