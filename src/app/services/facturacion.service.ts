import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';
import { Invoice } from '../modelo/Invoice';

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
        return this.apiService.get(this.apiServer + '/facturacion/facturas/organizacion/activos')
            .pipe(
                catchError(this.handleError('FacturacionService.getFacturasPorUsuario'))
            )
    }

    crearEnviarFactura(factura: Invoice): Observable<Invoice> {
        if (factura.id && factura.uuid) {
            return this.apiService.put(this.apiServer + '/comprobantes/factura', factura)
                .pipe(map(data => data));
        } else {
            return this.apiService.post(this.apiServer + '/comprobantes/factura', factura)
                .pipe(map(data => data));
        }
    }

}