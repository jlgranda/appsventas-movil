import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UIService, User } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';

import * as CryptoJS from 'crypto-js';

import { environment } from "src/environments/environment";

import { validateDni } from 'src/app/shared/helpers';
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

    async guardarNuevoUsuario(event) {

        const loading = await this.loadingController.create({
            message: 'Procesando factura...',
            cssClass: 'my-loading-class',
        });
        await loading.present();

        let valido: boolean = true;

        if (!this.newUser.code || !validateDni(this.newUser.code.toString())) {
            this.uiService.presentToastSeverityHeader("error", "C.I", "El número de cédula no es válido.");
            setTimeout(() => {
                loading.dismiss();
            });
            valido = false;
        }

        if (valido) {
            //Encriptar contraseña
            var encrypted = CryptoJS.AES.encrypt(this.password, environment.credential_app);
            this.newUser.password = encrypted.toString();

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
