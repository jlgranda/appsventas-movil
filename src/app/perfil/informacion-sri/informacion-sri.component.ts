import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { UIService, User, UserService } from 'src/app/core';
import { CertificadoDigital } from 'src/app/modelo/CertificadoDigital';
import { CertificadoPopupComponent } from '../certificado-popup/certificado-popup.component';
import { Organization } from 'src/app/modelo/Organization';
import { PerfilService } from '../perfil.service';
import { validateRUC } from 'src/app/shared/helpers';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AppComponent } from 'src/app/app.component';

@Component({
    selector: 'app-informacion-sri',
    templateUrl: './informacion-sri.component.html',
    styleUrls: ['./informacion-sri.component.scss']
})
export class InformacionSriComponent implements OnInit {

    //INITIAL
    currentUser: User;

    //DATA
    organization: Organization = new Organization();

    //UX
    photo: string;
    photoChange: boolean = false;
    ambienteSRI: boolean = false;
    initials: string;

    valido: boolean = false;
    
    app: AppComponent;

    constructor(
        public userService: UserService,
        private modalController: ModalController,
        private uiService: UIService,
        private perfilService: PerfilService,
        private loadingController: LoadingController,
        private camera: Camera
    ) { }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            if (this.currentUser) {
                this.valido = true;
                this.cargarDatosRelacionados();
            }

        });
    }

    async cargarDatosRelacionados() {
        this.organization.numeroLocales = 0;
        this.photo = null;
        //Generar las iniciales
        this.initials = this.generateInitials(this.currentUser.initials);
        if (this.currentUser.organization) {
            this.organization = this.currentUser.organization;
            if (this.organization.image) {
                this.photo = this.organization.image;
            }
            if (!this.organization.ambienteSRI || this.organization.ambienteSRI == "PRUEBAS") {
                this.ambienteSRI = false;
            }
            if (!this.organization.numeroLocales) {
                this.organization.numeroLocales = 1;
            }
        }
        //        this.photo = 'data:image/jpeg;base64,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';
        //        this.organization.image = this.photo;
    }

    async guardarOrganizacion(event) {

        const loading = await this.loadingController.create({
            message: 'Procesando...',
            cssClass: 'my-loading-class',
        });
        await loading.present();

        let valido: boolean = true;

        if (this.currentUser.initials && (this.currentUser.initials.length == 0 || this.currentUser.initials == 'RUC NO VALIDO')) {
            this.uiService.presentToastSeverityHeader("error", "Nombre comercial", "Indique un nombre comercial válido.");
            valido = false;
        }

        if (!this.currentUser.ruc || !validateRUC(this.currentUser.ruc.toString())) {
            this.uiService.presentToastSeverityHeader("error", "RUC", "El número de RUC no es válido.");
            valido = false;
        }

        if (valido) {
            if (!this.organization.ambienteSRI) {
                if (this.ambienteSRI) {
                    this.organization.ambienteSRI = "PRODUCCION";
                } else {
                    this.organization.ambienteSRI = "PRUEBAS";
                }
            }
            //Enviar certificado al API
            this.organization.ruc = this.currentUser.ruc;
            this.organization.initials = this.currentUser.initials;
            this.organization.direccion = this.currentUser.direccion;
            this.photoChange = true;
            this.organization.image = (this.photoChange && this.photo) ? this.photo : null;
            //Guardar las preferencias de la organización en persistencia
            this.perfilService.enviarOrganization(this.organization).subscribe(
                (data) => {
                    setTimeout(() => {
                        loading.dismiss();
                    });
                    this.uiService.presentToastSeverity("success", "Se configuró la Organización con éxito.");
                    this.userService.populate(); //Forzar la carga de los nuevos datos
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
    async compartirOrganizacion(event) {

        let valido: boolean = true;

        if (this.currentUser.initials && (this.currentUser.initials.length == 0 || this.currentUser.initials == 'RUC NO VALIDO')) {
            this.uiService.presentToastSeverityHeader("error", "Nombre comercial", "Indique un nombre comercial válido.");
            valido = false;
        }

        if (!this.currentUser.ruc || !validateRUC(this.currentUser.ruc.toString())) {
            this.uiService.presentToastSeverityHeader("error", "RUC", "El número de RUC no es válido.");
            valido = false;
        }

        if (valido) {
            if (!this.organization.ambienteSRI) {
                if (this.ambienteSRI) {
                    this.organization.ambienteSRI = "PRODUCCION";
                } else {
                    this.organization.ambienteSRI = "PRUEBAS";
                }
            }
            //Enviar certificado al API
            this.organization.ruc = this.currentUser.ruc;
            this.organization.initials = this.currentUser.initials;
            this.organization.direccion = this.currentUser.direccion;
            this.photoChange = true;
            this.organization.image = (this.photoChange && this.photo) ? this.photo : null;
            async () => {
                const title = `RUC: ${this.organization.ruc}\n`
                const summary = `${title}.\nRazón social: ${this.organization.initials}\nDirección:${this.organization.direccion}\nCorreo:${this.currentUser.username}\n\nAhora facturar es más FAZil con el app de facturación exclusiva para profesionales, buscala en el AppStore\n\n`
                const url="http://jlgranda.com/entry/fazil-facturacion-electronica-para-profesionales";
                this.app.sendShare(summary, title, url);
            }
        }
    }

    /**
    * Ir a subir certificado
    */
    async irAPopupCertificado(event) {
        const modal = await this.modalController.create({
            component: CertificadoPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-class',
            componentProps: {
                'certificado': new CertificadoDigital(),
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {

            }
        });

        return await modal.present();
    }

    /**
    ** Utilitarios
    */
    generateInitials(initials: string): string {
        let letters = '';
        if (initials && initials.length > 0) {
            const name = initials.split(' ');
            if (name.length > 1) {
                letters = name[0].charAt(0) + name[1].charAt(0);
            } else {
                letters = name.shift().charAt(0);
            }
        }
        return letters;
    }

    async onTakePicture() {
        const options: CameraOptions = {
            quality: 60,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
        }
        await this.procesarImagen(options);
    }

    async procesarImagen(options: CameraOptions) {
        this.camera.getPicture(options).then((imageData) => {
            let imageBase64 = 'data:image/jpeg;base64,' + imageData;
            this.photo = imageBase64;
            this.photoChange = true;
            this.uiService.presentToastSeverity("success", "Logo de Organización almacenado para su actualización.");
        }, (err) => {
            if (err != 'No Image Selected') {
                this.uiService.presentToast("Imagen no seleccionada.");
            } else {
                this.uiService.presentToastSeverityHeader("error",
                    err["type"] ? err["type"] : '',
                    err["message"] ? err["message"] : err);
            }
        });
    }

    cambiarAmbienteSRI(event) {
        if (event) {
            if (event.target.checked) {
                this.organization.ambienteSRI = "PRODUCCION";
            } else {
                this.organization.ambienteSRI = "PRUEBAS";
            }
        }
    }

}
