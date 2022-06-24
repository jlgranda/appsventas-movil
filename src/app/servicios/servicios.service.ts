import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';
import { Product } from '../modelo/Product';

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
    
    /*************************************************************************************
    **ENVELOPE
    **************************************************************************************/
    async getProductosPorOrganizacionDeUsuarioConectadoData(): Promise<any> {
        return this.getProductosPorOrganizacionDeUsuarioConectado().toPromise();
    }

    async getProductosPorTipoYOrganizacionDeUsuarioConectadoData(productType: any): Promise<any> {
        return this.getProductosPorTipoYOrganizacionDeUsuarioConectado(productType).toPromise();
    }
    
    /*************************************************************************************
    **REQUEST HTTP
    **************************************************************************************/
    getProductosPorOrganizacionDeUsuarioConectado() {
        return this.apiService.get(this.apiServer + '/servicios/organizacion/activos')
        .pipe(
            catchError(this.handleError('ServiciosService.getProductosPorOrganizacionDeUsuarioConectado'))
        );
    }

    getProductosPorTipoYOrganizacionDeUsuarioConectado(productType: any) {
        return this.apiService.get(this.apiServer + '/servicios/organizacion/tipo/' + productType + '/activos')
        .pipe(
            catchError(this.handleError('ServiciosService.getProductosPorTipoYOrganizacionDeUsuarioConectado'))
        );
    }

    enviarProducto(product: Product) {
        if (product.id && product.uuid) {
            return this.apiService.put(this.apiServer + '/servicios', product)
                .pipe(map(data => data['product']));
        } else {
            return this.apiService.post(this.apiServer + '/servicios', product)
                .pipe(map(data => data['product']));
        }
    }

}
