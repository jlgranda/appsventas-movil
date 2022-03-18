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

    async buscarUsuario(event) {
        this.valido = true;

        const loading = await this.loadingController.create({
            message: 'Verificando Número de Identificación...',
            cssClass: 'my-loading-class',
        });
        await loading.present();

        if (!this.newUser.code || (this.newUser.code.length == 10 && !validateDni(this.newUser.code.toString()))) {
            setTimeout(() => {
                loading.dismiss();
            });
            this.valido = false;
            this.uiService.presentToastSeverityHeader("error", "¡C.I!", "El número de cédula no es válido.");
        } else if (this.newUser.code.length == 13 && !validateRUC(this.newUser.code.toString())) {
            setTimeout(() => {
                loading.dismiss();
            });
            this.valido = false;
            this.uiService.presentToastSeverityHeader("error", "¡RUC!", "El RUC no es válido.");
        }

        if (this.valido) {
            //Buscar si existe un usuario con ese code
            let usuarioExistente = await this.getUserPorCode(this.newUser.code);
            if (usuarioExistente && usuarioExistente['uuid']) {
                this.newUser = usuarioExistente;
            }

            setTimeout(() => {
                loading.dismiss();
            });

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

            //        let valido: boolean = true;

            //        if (!this.newUser.code || !validateDni(this.newUser.code.toString())) {
            //            this.uiService.presentToastSeverityHeader("error", "C.I", "El número de cédula no es válido.");
            //            setTimeout(() => {
            //                loading.dismiss();
            //            });
            //            valido = false;
            //        }

            //        if (valido) {
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
