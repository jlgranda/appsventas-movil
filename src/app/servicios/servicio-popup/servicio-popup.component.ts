import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Product } from 'src/app/modelo/Product';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { UIService } from 'src/app/core';

@Component({
    selector: 'app-servicio-popup',
    templateUrl: './servicio-popup.component.html',
    styleUrls: ['./servicio-popup.component.scss']
})
export class ServicioPopupComponent implements OnInit {

    @Input() product: Product;
    iva12: boolean = true;

    constructor(
        private modalController: ModalController,
        private uiService: UIService,
        private actionSheetController: ActionSheetController,
        private camera: Camera
    ) { }

    ngOnInit(): void {
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async addProduct(event) {
        if (!this.iva12) {
            this.product.taxType = 'NONE';
        }
        await this.modalController.dismiss(this.product);
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
            this.product.photo = '/assets/layout/images/product.png';
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
            this.product.photo = imageBase64;
            this.uiService.presentToast("¡Bien! Se cambió la foto del servicio.");
        }, (err) => {
            // Handle error
        });
    }

}
