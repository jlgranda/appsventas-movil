import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';
import { CertificadoDigital } from '../modelo/CertificadoDigital';
import { CuentaBancaria } from '../modelo/CuentaBancaria';
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

    getUserPorCode(code: string) {
        return this.apiService.get(this.apiServer + '/users/code/' + code + '')
            .pipe(
                catchError(this.handleError('PerfilService.getUserPorCode'))
            )
    }

    getUserImage() {
        return this.apiService.get(this.apiServer + '/user/image')
            .pipe(
                catchError(this.handleError('PerfilService.getUserImage'))
            )
    }

    enviarCertificado(certificadoDigital: CertificadoDigital) {
        if (certificadoDigital.base64 && certificadoDigital.password) {
            return this.apiService.post(this.apiServer + '/comprobantes/firmaelectronica', certificadoDigital)
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

    getUserOrganizationImage() {
        return this.apiService.get(this.apiServer + '/user/organization/image')
            .pipe(
                catchError(this.handleError('PerfilService.getUserOrganizationImage'))
            )
    }

    enviarOrganization(organization: Organization) {
        if (organization.ambienteSRI && organization.numeroLocales) {
            return this.apiService.put(this.apiServer + '/organization', organization)
                .pipe(map(data => data));
        }
    }
    
    getCuentasBancariasPorOrganizacionDeUsuarioConectado() {
        return this.apiService.get(this.apiServer + '/organization/cuentabancaria/activos')
        .pipe(
            catchError(this.handleError('PerfilService.getCuentasBancariasPorOrganizacionDeUsuarioConectado'))
        );
    }

    enviarCuentaBancaria(cuentaBancaria: CuentaBancaria) {
        if (cuentaBancaria.uuid) {
            return this.apiService.put(this.apiServer + '/organization/cuentabancaria', cuentaBancaria)
                .pipe(map(data => data['cuentaBancaria']));
        } else {
            return this.apiService.post(this.apiServer + '/organization/cuentabancaria', cuentaBancaria)
                .pipe(map(data => data['cuentaBancaria']));
        }
    }
//    2903065574

}
