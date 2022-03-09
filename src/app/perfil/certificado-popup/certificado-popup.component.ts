import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CertificadoDigital } from 'src/app/modelo/CertificadoDigital';

import { Errors, UserService, UIService } from 'src/app/core';

import * as CryptoJS from 'crypto-js';
import { environment } from "src/environments/environment";

@Component({
    selector: 'app-certificado-popup',
    templateUrl: './certificado-popup.component.html',
    styleUrls: ['./certificado-popup.component.scss']
})
export class CertificadoPopupComponent implements OnInit {

    @Input() certificado: CertificadoDigital;

    archivo: any;
    
    password:string = "";
    
    //Configuraciones generales
    configuracion = environment.settings;

    constructor(
        private modalController: ModalController,
        private uiService: UIService,
    ) { 
    }

    ngOnInit(): void {
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    }

    async addCertificado(event) {
        var encrypted = CryptoJS.AES.encrypt(this.password, environment.credential_app);
        this.certificado.password = encrypted;
        await this.modalController.dismiss(this.certificado);
    }

    loadFileFromDevice(event) {

        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = () => {
            // get the blob of the image:
            //let blob: Blob = new Blob([new Uint8Array((reader.result as ArrayBuffer))]);
            // create blobURL, such that we could use it in an image element:
            //let blobURL: string = URL.createObjectURL(blob);
            const buffer: String|ArrayBuffer = reader.result;
            this.certificado.base64 = this.arrayBufferToBase64(buffer);
            this.uiService.presentToast("Firma electrónica cifrada, ingrese la contraseña.");
        };

        reader.onerror = (error) => {
            //handle errors
        };

    }
    
    arrayBufferToBase64(buffer) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}
