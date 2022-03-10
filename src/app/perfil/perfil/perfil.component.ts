import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Message, MessageService } from 'primeng/api';

import { UIService, User, UserService } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { ActionSheetController, MenuController, ModalController } from '@ionic/angular';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ComprobantesService } from 'src/app/services/comprobantes.service';
import { AppComponent } from 'src/app/app.component';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { CertificadoPopupComponent } from '../certificado-popup/certificado-popup.component';
import { CertificadoDigital } from 'src/app/modelo/CertificadoDigital';
import { PerfilService } from '../perfil.service';
import { PerfilModel } from 'src/app/modelo/Perfil.model';
import { UserData } from 'src/app/modelo/user.data';
import { validateRUC } from 'src/app/shared/helpers';

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

    ambienteSRI: string;

    userPhoto = '/assets/layout/images/0d2bbf5cb6e45bd5af500f750dd8f699.png';

    msgs: Message[] = [];

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
        private actionSheetController: ActionSheetController,
        private camera: Camera
    ) {
        this.app = appController;
    }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            if (this.currentUser && this.currentUser.uuid) {
                this.cargarDatosRelacionados();
            }
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

    async presentarOpcionesActionSheet() {
        const actionSheet = await this.actionSheetController.create({
            header: 'OPCIONES',
            cssClass: 'my-actionsheet-class',
            buttons: [
                {
                    text: 'Eliminar foto',
                    role: 'destructive',
                    icon: 'trash',
                    handler: () => {
                        console.log('Quitar foto');
                        //Quitar foto
                        this.onTakePicture('REMOVE');
                    }
                }, {
                    text: 'Seleccionar de Galería',
                    icon: 'images',
                    handler: () => {
                        console.log('Galería');
                        //Galería
                        this.onTakePicture('PHOTOLIBRARY');
                    }
                }, {
                    text: 'Hacer nueva foto',
                    icon: 'camera',
                    handler: () => {
                        console.log('Cámara');
                        //Galería
                        this.onTakePicture('CAMERA');
                    }
                }, {
                    text: 'Cancelar',
                    icon: 'close',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancelar');
                    }
                }]
        });
        await actionSheet.present();

        const { role, data } = await actionSheet.onDidDismiss();
    }

    async onTakePicture(type) {
        if (type == 'REMOVE') {
            this.userPhoto = '/assets/layout/images/0d2bbf5cb6e45bd5af500f750dd8f699.png';
            this.uiService.presentToastSeverity("success", "Se cambió la foto del perfil con éxito.");
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
            this.uiService.presentToastSeverity("success", "Se cambió la foto del perfil con éxito.");
        }, (err) => {
            // Handle error
        });
    }


    async cambiarAmbienteSRI() {
        if (this.ambienteSRI == 'PRODUCCION') {
            this.ambienteSRI = "PRUEBAS";
        }

        //TODO enviar a algun servicio para actualizar
    }

    guardarPerfil(evt: any) {
        this.messageService.clear();
        let user: UserData = {} as UserData;
        user.id = this.currentUser.id;
        user.email = this.currentUser.email;
        user.username = this.currentUser.username;
        user.nombre = this.currentUser.nombre;
        user.bio = this.currentUser.bio;
        user.mobileNumber = this.currentUser.mobileNumber;

        user.ruc = this.currentUser.ruc;
        user.initials = this.currentUser.initials;
        user.direccion = this.currentUser.direccion;

        let valido: boolean = true;
        if (!validateRUC(user.ruc)) {
            this.messageService.add({ severity: 'error', summary: "RUC", detail: "El número de RUC no es válido, verifique e intente nuevamente." });
            valido = false;
        }

        if (user.initials && user.initials == 'RUC NO VALIDO') {
            this.messageService.add({ severity: 'error', summary: "Nombre comercial", detail: "Indique un nombre comercial válido" });
            valido = false;
        }

        if (valido) {
            //Enviar certificado al API
            this.userService.update(user).subscribe(
                async (data) => {
                    this.userService.populate(); //Forzar la carga de los nuevos datos
                    this.messageService.add({ severity: 'success', summary: "¡Bien!", detail: `Listo para facturar FAZil` });
                },
                (err) => {
                    this.messageService.clear();
                    this.messageService.add({ severity: 'error', summary: err["type"], detail: err["message"] });
                }
            );
        }
    }

}
