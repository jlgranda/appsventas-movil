import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { UIService, User, UserService } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { MenuController, ModalController } from '@ionic/angular';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ComprobantesService } from 'src/app/services/comprobantes.service';
import { AppComponent } from 'src/app/app.component';
import { PerfilPhotoPopupComponent } from '../perfil-photo-popup/perfil-photo-popup.component';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { CertificadoPopupComponent } from '../certificado-popup/certificado-popup.component';
import { CertificadoDigital } from 'src/app/modelo/CertificadoDigital';
import { PerfilService } from '../perfil.service';

@Component({
    selector: 'app-perfil',
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

    //Autenticación
    isAuthenticated: boolean;
    tags: Array<string> = [];
    tagsLoaded = false;
    currentUser: User;

    //Data
    facturas: Invoice[] = [];
    facturasFiltrados: Invoice[] = [];
    facturasRecibidas: Invoice[] = [];
    facturasRecibidasFiltrados: Invoice[] = [];

    sortOrder: number;
    sortField: string;

    keyword: string;
    keywordReceived: string;

    app: AppComponent;

    userPhoto = '/assets/layout/images/0d2bbf5cb6e45bd5af500f750dd8f699.png';

    constructor(
        private router: Router,
        public userService: UserService,
        private comprobantesService: ComprobantesService,
        private messageService: MessageService,
        private menu: MenuController,
        private modalController: ModalController,
        private appController: AppComponent,
        private uiService: UIService,
        private perfilService: PerfilService,
        private camera: Camera
    ) {
        this.app = appController;
    }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            this.cargarDatosRelacionados();
        });

    }

    async cargarDatosRelacionados() {
        if (this.currentUser && this.currentUser.image) {
            this.userPhoto = this.currentUser.image;
        }
    }

    async irAPopupCertificado(event) {
        const modal = await this.modalController.create({
            component: CertificadoPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-custom-class',
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

    async irAGaleriaOpciones() {
        const modal = await this.modalController.create({
            component: PerfilPhotoPopupComponent,
            cssClass: 'transparent-modal'
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                if (modalDataResponse.role !== 'backdrop') {
                    this.onTakePicture(modalDataResponse.data);
                }
            }
        });

        return await modal.present();
    }

    async onTakePicture(type) {
        if (type == 'REMOVE') {
            this.userPhoto = '/assets/layout/images/0d2bbf5cb6e45bd5af500f750dd8f699.png';
        } else {
            const options: CameraOptions = {
                quality: 60,
                destinationType: this.camera.DestinationType.DATA_URL,
                encodingType: this.camera.EncodingType.JPEG,
                mediaType: this.camera.MediaType.PICTURE,
                correctOrientation: true,
                sourceType: this.camera.PictureSourceType[type]
            }
            this.procesarImagen(options);
        }
    }

    async procesarImagen(options: CameraOptions) {
        this.camera.getPicture(options).then((imageData) => {
            let imageBase64 = 'data:image/jpeg;base64,' + imageData;
            this.userPhoto = imageBase64;
            this.uiService.presentToast("¡Bien! Se cambió su foto de perfil.");
        }, (err) => {
            // Handle error
        });
    }

}
