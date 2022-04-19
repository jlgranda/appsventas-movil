import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UIService, User } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';

import * as CryptoJS from 'crypto-js';

import { environment } from "src/environments/environment";

import { validateDni } from 'src/app/shared/helpers';
import { validateRUC } from 'src/app/shared/helpers';
import { UsuarioModel } from 'src/app/modelo/usuario.model';
import { PerfilService } from '../perfil.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
    selector: 'app-registro',
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {

    newUser: UsuarioModel = new UsuarioModel();

    password: string = '';
    passwordConfirm: string = '';
    passwordInvalid: boolean = false;
    valido: boolean = true;
    //    code: string = '';

    constructor(
        private router: Router,
        private uiService: UIService,
        private perfilService: PerfilService,
        private alertController: AlertController,
        private loadingController: LoadingController,
    ) { }

    ngOnInit(): void {
    }

    irARegistrarCancel(event) {
        this.router.navigate(['login']);
    }

    public getUserPorCode(code: string): Promise<any> {
        return this.perfilService.getUserPorCode(code).toPromise();
    }

    async searchSubjectPorCode(event) {
        this.valido = false;
        let code: string = event.target.value.toString();
        let tipo = 'cedula';
        console.log("code", code);
        console.log("code.length", code.length);
        if (code && !(code.length == 10 || code.length == 13)) {
            return;
        }
        this.newUser = new UsuarioModel();
        
        const loading = await this.loadingController.create({
            message: 'Verificando Número de Identificación...',
            cssClass: 'my-loading-class',
        });
        await loading.present();


        if (code && code.length == 10) {
            this.valido = validateDni(code);
            tipo = "cedula";
        } else if (code && code.length == 13) {
            this.valido = validateRUC(code);
            tipo = "ruc";
        }

        if (this.valido) {
            //Buscar si existe un usuario con ese code
            let usuarioExistente = await this.getUserPorCode(code);
            if (usuarioExistente && usuarioExistente['uuid']) {
                this.newUser = usuarioExistente;
                this.uiService.presentToastSeverityHeader("warning", "¡Bienvenido!", "Estamos a poco de que gestionar tu negocio sea más FAZil");
            } else {
                this.newUser.code = code;
            }
            setTimeout(() => {
                loading.dismiss();
            });
        } else {
            setTimeout(() => {
                loading.dismiss();
            });
            if (!this.valido && tipo == 'cedula') {
                this.uiService.presentToastSeverityHeader("error", "¡C.I!", "El número de cédula de identidad no es válido.");
            } else if (!this.valido && tipo == 'ruc') {
                this.uiService.presentToastSeverityHeader("error", "¡RUC!", "El RUC no es válido.");
            }
        }
    }

    async guardarNuevoUsuario(event) {
        this.passwordInvalid = false;
        if (this.password && this.passwordConfirm && (this.passwordConfirm != this.password)) {
            this.passwordInvalid = true;
        }
        if (!this.passwordInvalid) {
            const loading = await this.loadingController.create({
                message: 'Procesando...',
                cssClass: 'my-loading-class',
            });
            await loading.present();

            if (this.valido) {
                //Encriptar contraseña
                var encrypted = CryptoJS.AES.encrypt(this.password, environment.credential_app);
                this.newUser.password = encrypted.toString();
                this.newUser.username = this.newUser.email; //El nombre de usuario para poder ingresar
                if (this.newUser) {
                    //Guardar subject
                    this.perfilService.enviarUser(this.newUser).subscribe(
                        async (data) => {
                            setTimeout(() => {
                                loading.dismiss();
                            });
                            const alert = await this.alertController.create({
                                cssClass: 'my-alert-class',
                                header: 'Confirmación!',
                                message: 'Usuario registrado con éxito.',
                                buttons: [
                                    {
                                        text: 'OK',
                                        handler: () => {
                                            this.router.navigate(['login']);
                                            this.newUser = new UsuarioModel();
                                        }
                                    }
                                ]
                            });
                            await alert.present();
                        },
                        (err) => {
                            setTimeout(() => {
                                loading.dismiss();
                            });
                            this.uiService.presentToastSeverityHeader("error",
                                err["type"] ? err["type"] : 'ERROR INTERNO DE SERVIDOR',
                                err["message"] ? err["message"] : 'Por favor revise los datos e inténte nuevamente.');
                        }
                    );
                }
            }
        }
    }

    /**
    ** Utilitarios
    */
    comparePassword(event) {
        this.passwordInvalid = false;
        if (this.password && this.passwordConfirm && (this.passwordConfirm != this.password)) {
            this.passwordInvalid = true;
        }
    }
}
