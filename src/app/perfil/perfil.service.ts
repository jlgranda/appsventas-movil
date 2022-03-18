import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';
import { CertificadoDigital } from '../modelo/CertificadoDigital';
import { Organization } from '../modelo/Organization';
import { Subject } from '../modelo/Subject';
import { UsuarioModel } from '../modelo/usuario.model';

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

    enviarUser(user: UsuarioModel) {
        if (user.code && user.email && user.password) {
            if (user.uuid) {
                return this.apiService.put(this.apiServer + '/users', user)
                    .pipe(map(data => data['user']));
            } else {
                return this.apiService.post(this.apiServer + '/users', user)
                    .pipe(map(data => data['user']));
            }
        }
    }

    getUserPorCode(code: string) {
        return this.apiService.get(this.apiServer + '/users/code/' + code + '')
            .pipe(
                catchError(this.handleError('PerfilService.getUserPorCode'))
            )
    }

}
