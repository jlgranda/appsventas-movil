import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CertificadoDigital } from 'src/app/modelo/CertificadoDigital';

import { Errors, UserService, UIService } from 'src/app/core';

import { PerfilService } from '../perfil.service';
import { MessageService } from 'primeng/api';
import { Message } from "primeng/api";

import * as CryptoJS from 'crypto-js';
import { environment } from "src/environments/environment";
import { HandleError, HttpErrorHandler } from 'src/app/http-error-handler.service';

@Component({
    selector: 'app-certificado-popup',
    templateUrl: './certificado-popup.component.html',
    styleUrls: ['./certificado-popup.component.scss']
})
export class CertificadoPopupComponent implements OnInit {

    @Input() certificado: CertificadoDigital;

    archivo: any;

    password: string = "";

    //Configuraciones generales
    configuracion = environment.settings;
    private handleError: HandleError;
    msgs: Message[] = [];

    constructor(
        private modalController: ModalController,
        private uiService: UIService,
        private perfilService: PerfilService,
        private messageService: MessageService,
        private httpErrorHandler: HttpErrorHandler,
    ) {
        this.handleError = httpErrorHandler.createHandleError('CertificadoPopupComponent');
    }

    ngOnInit(): void {
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    }

    async addCertificado(event) {
        var encrypted = CryptoJS.AES.encrypt(this.password, environment.credential_app);
        this.certificado.password = encrypted.toString();

        //Enviar certificado al API
        this.perfilService.enviarCertificado(this.certificado).subscribe(
            async (data) => {
                this.messageService.add({ severity: 'success', summary: "¡Bien!", detail: `Se registró el certificado con éxito.` });
                await this.modalController.dismiss(this.certificado);
            },
            async (err) => {
                this.messageService.add({ severity: 'error', summary: "Error en petición de servicio", detail: "FAZil no pudó resolver la petición, intente más tarde." });
            }
        );
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
            const buffer: String | ArrayBuffer = reader.result;
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
