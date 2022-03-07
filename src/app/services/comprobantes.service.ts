import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';
import { Invoice } from '../modelo/Invoice';

@Injectable({
    providedIn: 'root'
})
export class ComprobantesService {

    private apiServer = '';
    private handleError: HandleError;

    constructor(
        private apiService: ApiService, httpErrorHandler: HttpErrorHandler
    ) {
        this.apiServer = environment.settings.apiServer;
        this.handleError = httpErrorHandler.createHandleError('ComprobantesService');
    }

    /**
    * Retorna la lista de comprobantes activos del tipo <tt>tipo</tt>
    */
    getComprobantesPorUsuarioConectado(tipo: string) {
        return this.apiService.get(this.apiServer + '/comprobantes/' + tipo)
            .pipe(
                catchError(this.handleError('ComprobantesService.getComprobantesPorUsuarioConectado'))
            )
    }

    enviarFactura(factura: Invoice) {
        return this.apiService.post(this.apiServer + '/comprobantes/factura', factura)
            .pipe(map(data => data['factura']));
    }

}