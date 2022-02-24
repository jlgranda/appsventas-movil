import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpErrorHandler, HandleError } from '../../http-error-handler.service';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

const httpOptions = {
    reportProgress: true,
};

@Injectable()
export class UsersService {
    
    private apiServer = '';
    
    private handleError: HandleError;

    constructor(
      private apiService: ApiService,
      httpErrorHandler: HttpErrorHandler) {
        this.apiServer = environment.settings.apiServer;
        this.handleError = httpErrorHandler.createHandleError('UsuariosService');
    }

    listarActivos()  {
      return this.apiService.get(this.apiServer + '/users')
      .pipe(
        catchError(this.handleError('Usuarios.listarActivos'))
      )
    }
    
    listarFuncionariosMAGPorIdRol(idRol:number) {
       return this.apiService.get(this.apiServer + '/users/mag/' + idRol)
      .pipe(
        catchError(this.handleError('Usuarios.listarFuncionariosMAGPorIdRol'))
      ) 
    }
}
