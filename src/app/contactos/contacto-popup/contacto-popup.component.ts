import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Subject } from 'src/app/modelo/Subject';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ContactosService } from '../contactos.service';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { UIService } from 'src/app/core';

@Component({
    selector: 'app-contacto-popup',
    templateUrl: './contacto-popup.component.html',
    styleUrls: ['./contacto-popup.component.scss']
})
export class ContactoPopupComponent implements OnInit {

    @Input() subjectCustomer: SubjectCustomer;
    customer: Subject = new Subject();

    initialsList: string[] = [];
    initialsListView: boolean = true;

    movilImtem: any;
    movilList = [
        { name: 'Móvil', value: 'movil' },
        { name: 'Trabajo', value: 'work' }
    ];
    movilListSelect: any[] = [];

    isRUC: boolean = false;
    isCI: boolean = true;

    constructor(
        private contactosService: ContactosService,
        private modalController: ModalController,
        private uiService: UIService,
        private actionSheetController: ActionSheetController,
        private camera: Camera
    ) {
    }

    ngOnInit(): void {
        if (this.subjectCustomer) {
            if (this.subjectCustomer.customer) {
                this.customer = this.subjectCustomer.customer;
            }
        }
        if (this.customer && !this.customer.photo) {
            this.customer.photo = '/assets/layout/images/0d2bbf5cb6e45bd5af500f750dd8f699.png';
        }
        this.movilImtem = this.movilList.find((item) => item.value === 'movil');
        this.movilListSelect.push(1);
    }

    async getInitialsPorKeyword(keyword: string): Promise<any> {
        return this.contactosService.getInitialsPorKeyword(keyword).toPromise();
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async addSubjectCustomer(event) {
        this.subjectCustomer.customer = this.customer;
        await this.modalController.dismiss(this.subjectCustomer);
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
            this.customer.photo = '/assets/layout/images/0d2bbf5cb6e45bd5af500f750dd8f699.png';
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
            this.uiService.presentToast("¡Bien! Se cambió la foto del usuario.");
        }, (err) => {
            // Handle error
        });
    }

    /**
    ** Utilitarios
    */
    async onFilterListItems(event) {
        let query = event.target.value;
        this.initialsList = [];
        if (query && query.length > 2 && query.length < 6) {
            this.initialsList = await this.getInitialsPorKeyword(query.toLowerCase());
            this.initialsListView = true;
        }
    }

    async onItem(event, item) {
        //Enviar la información del initials
        this.customer.initials = item.toUpperCase();
        this.initialsListView = false;
    }

    onSelectOption(event) {
        let value = event.target.value;
        if (value) {
            this.movilImtem = this.movilList.find((item) => item.value === value);
        }
    }

    onMovilInput(event) {
        let value = event.target.value;
        if (value) {
            switch (this.movilImtem.value) {
                case 'movil':
                    this.customer.mobileNumber = value;
                    break;
                case 'work':
                    this.customer.workPhoneNumber = value;
                    break;
            }
        }
    }

    onAddMovil(event) {
        this.movilListSelect.push(this.movilListSelect.length + 1);
    }

}
