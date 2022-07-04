import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, LoadingController, ModalController } from '@ionic/angular';
import { Subject } from 'src/app/modelo/Subject';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ContactosService } from '../contactos.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { UIService } from 'src/app/core';
import { Message, MessageService } from 'primeng/api';
import { PerfilService } from 'src/app/perfil/perfil.service';

import { validateDni } from 'src/app/shared/helpers';
import { validateRUC } from 'src/app/shared/helpers';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-contacto-popup',
    templateUrl: './contacto-popup.component.html',
    styleUrls: ['./contacto-popup.component.scss']
})
export class ContactoPopupComponent implements OnInit {

    @Input() subjectCustomer: SubjectCustomer;
    customer: Subject = new Subject();

    customerPhoto: string;
    initialsList: string[] = [];
    initialsListView: boolean = true;

    movilList = [
        { name: 'Móvil', value: 'movil' },
        { name: 'Trabajo', value: 'work' }
    ];
    movilListSelect: any[] = [];
    movilListValue: any[] = [];

    valido: boolean = true;
    code: string;

    constructor(
        private contactosService: ContactosService,
        private modalController: ModalController,
        private loadingController: LoadingController,
        private uiService: UIService,
        private actionSheetController: ActionSheetController,
        private camera: Camera,
    ) {
    }

    ngOnInit(): void {
        if (this.subjectCustomer) {
            if (this.subjectCustomer.customer) {
                this.customer = this.subjectCustomer.customer;
            }
        }
        if (this.customer && this.customer.photo) {
            this.customerPhoto = this.customer.photo;
        } else {
            this.customerPhoto = '/assets/layout/images/user.png';
        }

        this.code = (this.customer && this.customer.code) ? this.customer.code : "";
        
        this.movilListSelect.push(this.movilList ? this.movilList[0] : 0);
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async addSubjectCustomer(event) {
        const loading = await this.loadingController.create({
            message: 'Procesando...',
            cssClass: 'my-loading-class',
        });
        await loading.present();
        this.customer.photo = null;
        this.subjectCustomer.customerPhoto = null;
        this.subjectCustomer.customer = this.customer;

        if (this.subjectCustomer.customer) {
            //Guardar contacto en persistencia
            this.contactosService.enviarContacto(this.subjectCustomer).subscribe(
                async (data) => {
                    setTimeout(() => {
                        loading.dismiss();
                    });
                    this.uiService.presentToastSeverity("success", "Se registró el contacto con éxito.");
                    await this.modalController.dismiss(data);
                },
                (err) => {
                    setTimeout(() => {
                        loading.dismiss();
                    });
                    this.uiService.presentToastSeverityHeader("error",
                        err["type"] ? err["type"] : '¡Ups!',
                        err["message"] ? err["message"] : environment.settings.errorMsgs.error500);
                }
            );
        }

    };

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
                        //Quitar foto
                        console.log('Quitar foto');
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
                        //Galería
                        console.log('Cámara');
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
            this.customer.photo = null;
            this.customerPhoto = '/assets/layout/images/user.png';
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
            this.customer.photo = imageBase64;
            this.customerPhoto = this.customer.photo;
            this.uiService.presentToastSeverity("success", "Se cambió la foto del perfil con éxito.");
        }, (err) => {
            this.uiService.presentToastSeverityHeader("error", err["type"], err["message"]);
        });
    }

    async searchSubjectPorCode(event) {
        this.valido = true;
        this.code = event.target.value.toString().trim();
        let tipo = 'cedula';
        if (this.code && !(this.code.length == 10 || this.code.length == 13)) {
            return;
        }

        this.customer = new Subject();

        const loading = await this.loadingController.create({
            message: 'Verificando Número de Identificación...',
            cssClass: 'my-loading-class',
        });
        await loading.present();


        if (this.code && this.code.length == 10) {
            this.valido = validateDni(this.code);
            tipo = "cedula";
        } else if (this.code && this.code.length == 13) {
            this.valido = validateRUC(this.code);
            tipo = "ruc";
        }

        if (this.valido) {
            //Buscar si existe un usuario con ese code
            let usuarioExistente = await this.contactosService.getContactoPorCodeYUsuarioConectadoData(this.code);
            if (usuarioExistente && usuarioExistente['uuid']) {
                this.customer = usuarioExistente;
            } else {
                this.customer.code = this.code;
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

    /**
    ** Utilitarios
    */
    async onFilterListItems(event) {
        let query = event.target.value;
        this.initialsList = [];
        if (query && query.length > 2 && query.length < 6) {
            this.initialsList = await this.contactosService.getInitialsPorKeywordData(query.toLowerCase());
            this.initialsListView = true;
        }
    }

    async onItem(event, item) {
        //Enviar la información del initials
        this.customer.initials = item.toUpperCase();
        this.initialsListView = false;
    }

    onSelectOption(item): boolean {
        return (this.movilListValue && this.movilListValue.find(value => value == item.value)) ? true : false;
    }

    onMovilInput(event, item) {
        let value = event.target.value;
        if (value && item) {
            switch (item.value) {
                case 'movil':
                    this.customer.mobileNumber = value;
                    this.movilListValue.unshift(item.value);
                    break;
                case 'work':
                    this.customer.workPhoneNumber = value;
                    this.movilListValue.unshift(item.value);
                    break;
            }
        }
    }

    onAddMovil(event) {
        this.movilListSelect.push(this.movilList[this.movilListValue ? this.movilListValue.length : 0]);
    }

}
