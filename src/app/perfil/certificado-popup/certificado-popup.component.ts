import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CertificadoDigital } from 'src/app/modelo/CertificadoDigital';

@Component({
    selector: 'app-certificado-popup',
    templateUrl: './certificado-popup.component.html',
    styleUrls: ['./certificado-popup.component.scss']
})
export class CertificadoPopupComponent implements OnInit {

    @Input() certificado: CertificadoDigital;

    archivo: any;

    constructor(
        private modalController: ModalController,
    ) { }

    ngOnInit(): void {
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    }

    async addCertificado(event) {
        await this.modalController.dismiss(this.certificado);
    }

    loadImageFromDevice(event) {

        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = () => {
            // get the blob of the image:
            let blob: Blob = new Blob([new Uint8Array((reader.result as ArrayBuffer))]);
            // create blobURL, such that we could use it in an image element:
            let blobURL: string = URL.createObjectURL(blob);
            this.certificado.base64 = blobURL;
        };

        reader.onerror = (error) => {
            //handle errors
        };

    }
}
