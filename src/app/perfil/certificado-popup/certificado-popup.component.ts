import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CertificadoDigital } from 'src/app/modelo/CertificadoDigital';

import { Errors, User, UserService, UIService } from 'src/app/core';

import { PerfilService } from '../perfil.service';
import { MessageService } from 'primeng/api';
import { Message } from "primeng/api";

import * as CryptoJS from 'crypto-js';
import { environment } from "src/environments/environment";
import { HandleError, HttpErrorHandler } from 'src/app/http-error-handler.service';

import {getFileReader} from "src/app/shared/helpers"

import {FileUploadModule} from 'primeng/fileupload';

import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';

@Component({
    selector: 'app-certificado-popup',
    templateUrl: './certificado-popup.component.html',
    styleUrls: ['./certificado-popup.component.scss']
})
export class CertificadoPopupComponent implements OnInit {

    @Input() certificado: CertificadoDigital;
    
    currentUser: User;

    archivo: any;

    password: string = "";

    //Configuraciones generales
    configuracion = environment.settings;
    private handleError: HandleError;
    msgs: Message[] = [];

    constructor(
        private modalController: ModalController,
        public userService: UserService,
        private uiService: UIService,
        private perfilService: PerfilService,
        private messageService: MessageService,
        private callNumber: CallNumber,
        private httpErrorHandler: HttpErrorHandler
    ) {
        this.handleError = httpErrorHandler.createHandleError('CertificadoPopupComponent');
    }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData['user'] ? userData['user'] : userData;
            if (!this.currentUser.tieneCertificadoDigital){
                this.messageService.add({ severity: 'error', summary: "Firma digital no registrada", detail: `No ha configurado su certificado de firma digital, llamar por ayuda al ${environment.settings.app.contact.phone}` });
            }
        });
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
    
    
    loadFileFromDevice(event:any) {

        const file = event.target.files[0];
//        let reader = new FileReader();
//        if (file instanceof Blob) {
//            const realFileReader = (reader as any)._realReader;
//            if (realFileReader) {
//              reader = realFileReader;
//            }
//          }
        let reader = getFileReader();
        reader.onloadend = () => {
            // get the blob of the image:
            //let blob: Blob = new Blob([new Uint8Array((reader.result as ArrayBuffer))]);
            // create blobURL, such that we could use it in an image element:
            //let blobURL: string = URL.createObjectURL(blob);
            const buffer: String | ArrayBuffer = reader.result;
            this.certificado.base64 = this.arrayBufferToBase64(buffer);
            this.uiService.presentToastSeverity("warning", "Archivo cargado y cifrado.")
        };
        
        reader.readAsArrayBuffer(file);
        
        reader.onerror = (error) => {
            this.uiService.presentToastSeverity("error", "" + error)
        };
    }
    loadPrimeNGFileFromDevice(event:any) {

        const file = event.files[0];
//        let reader = new FileReader();
//        if (file instanceof Blob) {
//            const realFileReader = (reader as any)._realReader;
//            if (realFileReader) {
//              reader = realFileReader;
//            }
//          }
        let reader = getFileReader();
        reader.onloadend = () => {
            // get the blob of the image:
            //let blob: Blob = new Blob([new Uint8Array((reader.result as ArrayBuffer))]);
            // create blobURL, such that we could use it in an image element:
            //let blobURL: string = URL.createObjectURL(blob);
            const buffer: String | ArrayBuffer = reader.result;
            this.certificado.base64 = this.arrayBufferToBase64(buffer);
            this.uiService.presentToastSeverity("warning", "Archivo cargado y cifrado.")
        };
        
        reader.readAsArrayBuffer(file);
        
        reader.onerror = (error) => {
            this.uiService.presentToastSeverity("error", "" + error)
        };
    }

    arrayBufferToBase64(buffer:any) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    
    call($event){
        this.callNumber.callNumber("0984160038", true)
            .then(res => console.log('Llamando...', res))
            .catch(err => console.log('Error al realizar la llamada.', err));
        }
}
