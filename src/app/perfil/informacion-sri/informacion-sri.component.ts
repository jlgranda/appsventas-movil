import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UIService, User, UserService } from 'src/app/core';
import { CertificadoDigital } from 'src/app/modelo/CertificadoDigital';
import { CertificadoPopupComponent } from '../certificado-popup/certificado-popup.component';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Organization } from 'src/app/modelo/Organization';
import { PerfilService } from '../perfil.service';

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
    organizationPhoto: string;
    ambienteSRI: boolean = false;
    initials: string = 'JL';

    constructor(
        public userService: UserService,
        private modalController: ModalController,
        private uiService: UIService,
        private perfilService: PerfilService,
        private camera: Camera
    ) { }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            if (this.currentUser && this.currentUser.uuid) {
                this.cargarDatosRelacionados();
            }
        });
    }

    async cargarDatosRelacionados() {
        console.log("cargardatos");
        this.organizationPhoto = '/assets/layout/images/logo.png';
        if (this.currentUser.organization) {
            this.organization = this.currentUser.organization;
            if (this.organization.image) {
                this.organizationPhoto = this.organization.image;
            }
            if (!this.organization.ambienteSRI || this.organization.ambienteSRI == "PRUEBAS") {
                this.ambienteSRI = false;
            }
            if (!this.organization.numeroLocales) {
                this.organization.numeroLocales = 1;
            }
        }
    }

    guardarOrganizacion(event) {
        if (!this.organization.ambienteSRI) {
            if (this.ambienteSRI) {
                this.organization.ambienteSRI = "PRODUCCION";
            } else {
                this.organization.ambienteSRI = "PRUEBAS";
            }
        }
        if (this.organization) {
            //Guardar las preferencias de la organización en persistencia
            this.perfilService.enviarOrganization(this.organization).subscribe(
                (data) => {
                    this.userService.currentUser.subscribe(userData => {
                        this.currentUser = userData;
                        this.uiService.presentToastSeverity("success", "Se configuró la Organización con éxito.");
                        if (this.currentUser && this.currentUser.uuid) {
                            this.cargarDatosRelacionados();
                        }
                    });
                },
                (err) => {
                    this.uiService.presentToastSeverityHeader("error", err["type"], err["message"]);
                }
            );
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
    async openGallery() {
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
            this.organization.photo = imageBase64;
            this.organizationPhoto = imageData;
            this.uiService.presentToastSeverity("success", "Se cambió la foto de la organización con éxito.");
        }, (err) => {
            // Handle error
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
