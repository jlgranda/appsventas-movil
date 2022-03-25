import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Message, MessageService } from 'primeng/api';

import { UIService, User, UserService } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { ActionSheetController, LoadingController, MenuController, ModalController } from '@ionic/angular';
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
import { validateDni } from 'src/app/shared/helpers';
import { StorageService } from 'src/app/services/storage.service';

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

    photo = '/assets/layout/images/user.png';
    photoChange: boolean = false;

    msgs: Message[] = [];

    code: string;
    codeInvalid: boolean = false;

    valido: boolean = false;

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
        private loadingController: LoadingController,
        private camera: Camera,
        private storageService: StorageService,
    ) {
        this.app = appController;
    }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            if (this.currentUser) {
                if (this.currentUser.initials && this.currentUser.initials != 'RUC NO VALIDO') {
                    this.valido = true;
                    this.cargarDatosRelacionados();
                }
            }
        });
    }

    async cargarDatosRelacionados() {
        if (this.currentUser && this.currentUser.image) {
            this.photo = this.currentUser.image;
        }
        this.codeInvalid = (!this.currentUser.code
            || (this.currentUser.code && (this.currentUser.code.length < 10 || this.currentUser.code.length > 13)));
        this.photo = 'data:image/jpeg;base64,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';
        this.currentUser.image = this.photo;
    }

    async guardarPerfil(evt: any) {

        const loading = await this.loadingController.create({
            message: 'Procesando...',
            cssClass: 'my-loading-class',
        });
        await loading.present();

        this.messageService.clear();

        let valido: boolean = true;

        let user: User = {} as User;

        if (this.codeInvalid && (!this.code || !validateDni(this.code.toString()))) {
            this.uiService.presentToastSeverityHeader("error", "¡C.I!", "El número de cédula no es válido.");
            valido = false;
            setTimeout(() => {
                loading.dismiss();
            });
        }

        if (valido) {

            if (this.codeInvalid) {
                user.code = this.code;
            } else {
                user.code = null;
            }

            //Data Base
            user.id = this.currentUser.id;
            user.uuid = this.currentUser.uuid;
            user.ruc = this.currentUser.ruc;
            user.initials = this.currentUser.initials;

            //Data Update
            user.firstname = this.currentUser.firstname;
            user.surname = this.currentUser.surname;
            user.mobileNumber = this.currentUser.mobileNumber;
            user.direccion = this.currentUser.direccion;
            user.bio = this.currentUser.bio;
            user.image = (this.photoChange && this.photo && this.photo != '/assets/layout/images/user.png') ? this.currentUser.image : null;

            //Enviar certificado al API
            this.userService.update(user).subscribe(
                async (data) => {
                    //Guardar la nueva foto del user en memoria
                    if (user.image) {
                        this.storageService.set('photoUser', user.image);
                    }
                    setTimeout(() => {
                        loading.dismiss();
                    });
                    this.messageService.add({ severity: 'success', summary: "¡Bien!", detail: ` Listo para facturar FAZil` });
                    this.userService.populate(); //Forzar la carga de los nuevos datos
                },
                (err) => {
                    setTimeout(() => {
                        loading.dismiss();
                    });
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error',
                        summary: err["type"] ? err["type"] : 'ERROR INTERNO DE SERVIDOR',
                        detail: err["message"] ? err["message"] : 'Por favor revise los datos e inténte nuevamente.'
                    });
                }
            );
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

    /**
    ** Utilitarios
    */
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
            this.photo = '/assets/layout/images/user.png';//Establecer la foto por defecto
            this.photoChange = true;
            this.uiService.presentToastSeverity("success", "Se cambió la foto del perfil con éxito.");
        } else {
            const options: CameraOptions = {
                quality: 60,
                destinationType: this.camera.DestinationType.DATA_URL,
                encodingType: this.camera.EncodingType.JPEG,
                mediaType: this.camera.MediaType.PICTURE,
                correctOrientation: true,
                sourceType: type == 'PHOTOLIBRARY' ? this.camera.PictureSourceType.PHOTOLIBRARY : this.camera.PictureSourceType.CAMERA
            }
            await this.procesarImagen(options);
        }
    }

    async procesarImagen(options: CameraOptions) {
        this.camera.getPicture(options).then((imageData) => {
            let imageBase64 = 'data:image/jpeg;base64,' + imageData;
            this.photo = imageBase64;
            this.photoChange = true;
            this.uiService.presentToastSeverity("success", "Foto de perfil almacenada para su actualización.");
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

}
