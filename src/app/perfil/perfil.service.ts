import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';
import { CertificadoDigital } from '../modelo/CertificadoDigital';
import { Organization } from '../modelo/Organization';

@Injectable({
    providedIn: 'root'
})
export class PerfilService {

    private apiServer = '';
    private handleError: HandleError;

    constructor(
        private apiService: ApiService,
        private httpErrorHandler: HttpErrorHandler,
    ) {
        this.apiServer = environment.settings.apiServer;
        this.handleError = httpErrorHandler.createHandleError('PerfilService');
    }

    enviarCertificado(certificadoDigital: CertificadoDigital) {
        if (certificadoDigital.base64 && certificadoDigital.password) {
            return this.apiService.post(this.apiServer + '/comprobantes/firmaelectronica', certificadoDigital)
                .pipe(map(data => data));
        }
    }

    enviarOrganization(organization: Organization) {
        if (organization.ambienteSRI && organization.numeroLocales) {
            return this.apiService.put(this.apiServer + '/user/organization', organization)
                .pipe(map(data => data));
        }
    }

}
