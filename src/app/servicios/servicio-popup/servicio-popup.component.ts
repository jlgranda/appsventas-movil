import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Product } from 'src/app/modelo/Product';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { UIService } from 'src/app/core';
import { ServiciosService } from '../servicios.service';

@Component({
    selector: 'app-servicio-popup',
    templateUrl: './servicio-popup.component.html',
    styleUrls: ['./servicio-popup.component.scss']
})
export class ServicioPopupComponent implements OnInit {

    @Input() product: Product;
    iva12: boolean = true;
    productPhoto: string;

    constructor(
        private modalController: ModalController,
        private uiService: UIService,
        private actionSheetController: ActionSheetController,
        private serviciosService: ServiciosService,
        private camera: Camera,
    ) { }

    ngOnInit(): void {
        if (this.product && this.product.photo) {
            this.productPhoto = this.product.photo;
        } else {
            this.productPhoto = '/assets/layout/images/product.png';
        }
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async addProduct(event) {
        if (!this.iva12) {
            this.product.taxType = 'NONE';
        }
        this.product.photo = null;

        if (this.product) {
            //Guardar producto en persistencia
            this.serviciosService.enviarProducto(this.product).subscribe(
                async (data) => {
                    this.uiService.presentToastSeverity("success", "Se registró el producto con éxito.");
                },
                (err) => {
                     this.uiService.presentToastSeverityHeader("error", err["type"], err["message"]);
                }
            );
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
            this.product.photo = null;
            this.productPhoto = '/assets/layout/images/product.png';
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
            this.productPhoto = this.product.photo;
            this.uiService.presentToast("¡Bien! Se cambió la foto del servicio.");
        }, (err) => {
            // Handle error
        });
    }

}
