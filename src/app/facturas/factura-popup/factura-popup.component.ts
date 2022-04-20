import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonRadioGroup, LoadingController, ModalController } from '@ionic/angular';
import { ContactosComponent } from 'src/app/contactos/contactos.component';
import { UIService, User, UserService } from 'src/app/core';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ServiciosComponent } from 'src/app/servicios/servicios.component';
import { ServiciosPopupComponent } from '../servicios-popup/servicios-popup.component';
import { ContactosPopupComponent } from '../contactos-popup/contactos-popup.component';
import { MessageService } from 'primeng/api';
import { ComprobantesService } from 'src/app/services/comprobantes.service';

import { environment } from "src/environments/environment";

import { validateDni } from 'src/app/shared/helpers';
import { validateRUC } from 'src/app/shared/helpers';
import { precisionRound } from 'src/app/shared/helpers';

@Component({
    selector: 'app-factura-popup',
    templateUrl: './factura-popup.component.html',
    styleUrls: ['./factura-popup.component.scss']
})
export class FacturaPopupComponent implements OnInit {

    @Input() factura: Invoice;
    currentUser: User;

    //DATA
    subjectCustomer: SubjectCustomer;
    details: InvoiceDetail[] = [];
    product: Product;

    //UX
    aplicarIva12: boolean = true;
    IVA12: number = 0.12;
    IVA0: number = 0.00;
    listLocal: any[] = [];
    isUnitDetail: boolean = true;
    exitenProductosSeleccionados:boolean = false;

    constructor(
        public userService: UserService,
        private uiService: UIService,
        private comprobantesService: ComprobantesService,
        private modalController: ModalController,
        private messageService: MessageService,
        private alertController: AlertController,
        private loadingController: LoadingController,
    ) { }

    ngOnInit(): void {
        this.isUnitDetail = !this.details || (this.details && this.details.length == 0) ? true : false;
        if (this.factura) {
            if (this.factura.subjectCustomer) {
                this.subjectCustomer = this.factura.subjectCustomer;
            }
            if (this.factura.product) {
                this.product = this.factura.product;
                this.calcularTotal(this.product.price);
            }
        }

        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            let localVal = "";
            let item: any;
            if (this.currentUser.organization && this.currentUser.organization.numeroLocales) {
                for (let i = 1; i <= this.currentUser.organization.numeroLocales; i++) {
                    localVal = '00' + i;
                    item = { name: localVal, value: localVal };
                    this.listLocal.push(item);
                }
            } else {
                localVal = '001';
                item = { name: localVal, value: localVal };
                this.listLocal.push(item);
            }
            this.factura.estab = this.listLocal[0].value;
        });
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    confirmarFacturar(event) {

        if (this.currentUser.tieneCertificadoDigital) {
            //Ventana de confirmación
            this.presentAlertConfirm();
        } else {
            this.uiService.presentToastSeverity("error",
                `Suscribase a Facturar FAZil, registre su certificado de firma electrónica llamando a ${environment.settings.app.contact.phone} o escribiendo a ${environment.settings.app.contact.email}.`);
        }
    }

    async presentAlertConfirm() {
        const alert = await this.alertController.create({
            cssClass: 'my-alert-class',
            header: 'Confirmación!',
            message: 'La factura será autorizada al SRI y notificada al cliente generando obligaciones tributarias. ¿Está seguro de continuar?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                    }
                }, {
                    text: 'Sí',
                    handler: () => {
                        this.addFactura(null);
                    }
                }
            ]
        });

        await alert.present();
    }

    async addFactura(event) {
        //Validar los datos del customer
        if (this.subjectCustomer.customerCode) {

            if (validateDni(this.subjectCustomer.customerCode) || validateRUC(this.subjectCustomer.customerCode)) {
                
                //Solicita servicio de facturación electrónica
                this.guardarFactura(event);
               
            } else {
                const alert = await this.alertController.create({
                    cssClass: 'my-alert-class',
                    header: 'CI/RUC INVÁLIDO!',
                    message: 'El número de identificación del cliente es inválido. Por favor actualice los datos.',
                    buttons: [
                        {
                            text: 'OK',
                            role: 'cancel',
                            handler: () => {
                                console.log('Cancelar');
                            }
                        }
                    ]
                });
                await alert.present();
            }
        }
    }

    async guardarFactura(event) {
        const loading = await this.loadingController.create({
            message: 'Procesando factura...',
            cssClass: 'my-loading-class',
        });
        await loading.present();

        //remover foto
        this.subjectCustomer.customerPhoto = "";
        //Asignar selecciones del usuario
        this.factura.emissionOn = new Date();
        //this.factura.product = this.product;
        this.factura.subjectCustomer = this.subjectCustomer;
        this.factura.iva12 = this.aplicarIva12;
        this.factura.details = this.details; //Los detalles de la factura
        if (this.factura && this.factura.subjectCustomer && this.factura.details) {
            this.factura.accionSRI = "emitir"; //Crea-enviar-autorizar-notificar
            this.factura.enviarSRI = true;
            //Guardar la factura en persistencia para luego recargar las facturas
            this.comprobantesService.enviarFactura(this.factura).subscribe(
                async (data) => {
                    setTimeout(() => {
                        loading.dismiss();
                    });
                    let dataValido: boolean = false;
                    let dataResult = data['result'] ? data['result'] : null;
                    let dataComprobante: any;
                    if (dataResult && dataResult['comprobantes'] && Array.isArray(dataResult['comprobantes'])) {
                        dataComprobante = dataResult['comprobantes'][0];
                    }
                    if (dataComprobante) {
                        let dataMensaje: any;
                        if (dataComprobante['mensajes'] && Array.isArray(dataComprobante['mensajes'])) {
                            dataMensaje = dataComprobante['mensajes'][0];
                        }
                        if (dataMensaje) {
                            dataValido = true;
                            const alert = await this.alertController.create({
                                cssClass: 'my-alert-class',
                                header: dataMensaje['mensaje'],
                                message: dataMensaje['informacionAdicional'],
                                buttons: [
                                    {
                                        text: 'OK',
                                        handler: async () => {
                                            if (dataMensaje['tipo'] == "ERROR") {
                                                await this.modalController.dismiss(this.factura);
                                            } else {
                                                //Enviar la información de la factura y lo correspondiente
                                                await this.modalController.dismiss(this.factura);
                                            }
                                        }
                                    }
                                ]
                            });
                            await alert.present();
                        }

                    }
                    if (!dataValido) {
                        if (dataResult['claveAcceso']) {
                            const alert = await this.alertController.create({
                                cssClass: 'my-alert-class',
                                header: '¡Bien!',
                                message: 'La factura fue autorizada por el SRI y se notificó al cliente.',
                                buttons: [
                                    {
                                        text: 'OK',
                                        role: 'cancel',
                                        handler: async () => {
                                            await this.modalController.dismiss(this.factura);
                                        }
                                    }
                                ]
                            });
                            await alert.present();
                        }
                    }
                },
                async (err) => {
                    setTimeout(() => {
                        loading.dismiss();
                    });
                    this.uiService.presentToastSeverityHeader("error",
                        err["type"] ? err["type"] : '¡Ups!',
                        err["message"] ? err["message"] : environment.settings.errorMsgs.error500);
                }
            );
        } else {
            setTimeout(() => {
                        loading.dismiss();
                    });
        }
    }

    /**
    * Ir a seleccionar Contacto
    */
    async irAPopupContactos(event) {
        const modal = await this.modalController.create({
            component: ContactosPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-class',
            componentProps: {
                'subjectCustomer': this.subjectCustomer,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.subjectCustomer = modalDataResponse.data;
                this.uiService.presentToastSeverity("info", `Facturar a ${this.subjectCustomer.customerFullName}`);
            }
        });

        return await modal.present();
    }

    /**
    * Ir a seleccionar Servicio
    */
    async irAPopupServicios(event) {
        const modal = await this.modalController.create({
            component: ServiciosPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-class',
            componentProps: {
                //                'product': this.product,
                'details': this.details,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                //Verificar la lista de details
                this.details = modalDataResponse.data;
                this.verificDetails();
            }
        });

        return await modal.present();
    }

    private verificDetails() {
        this.initVariables();
        if (this.details && this.details.length == 1) {//Solo es un detalle
            if (this.details[0].amount == 1) { //Solo un servicio
                this.agregarFacturaSimple(this.details[0]);
                this.isUnitDetail = true;
            } else {
                this.agregarFacturaComplex();
                this.isUnitDetail = false;
            }
        } else if (this.details && this.details.length > 1) {
            this.agregarFacturaComplex();
            this.isUnitDetail = false;
        }
    }

    private agregarFacturaSimple(detail: InvoiceDetail) {
        //Encerar sumadores
        this.factura.subTotalIva12 = 0;
        this.factura.iva12Total = 0;
        this.factura.subTotalIva0 = 0;
        this.product = detail.product; //Mantener compatibilidad con pantalla anterior
        if (!this.factura.subTotal) {
            if (this.product.taxType != 'IVA') {
                this.aplicarIva12 = false//Agregar el iva del producto
            }
            this.calcularTotal(this.product.price);
        }
        this.exitenProductosSeleccionados = this.product != null;
        
        this.uiService.presentToastSeverity("info", `Facturar por concepto de ${this.product.name}`);
    }

    private agregarFacturaComplex() {
        //Encerar sumadores
        this.factura.subTotalIva12 = 0;
        this.factura.iva12Total = 0;
        this.factura.subTotalIva0 = 0;
        
        //Calcular según los detalles actuales
        this.exitenProductosSeleccionados = false;
        if (this.details && this.details.length) {
            this.details.forEach(d => {
                if (d.product.taxType == 'IVA') {
                    let subtotal = d.amount * d.product.price;
                    this.factura.subTotalIva12 = this.factura.subTotalIva12 + precisionRound(subtotal, 2);
                    this.factura.iva12Total = this.factura.iva12Total + precisionRound(subtotal * (d.product.taxFactor / 100), 2);
                } else {
                    this.factura.subTotalIva0 = this.factura.subTotalIva0 + precisionRound(d.amount * d.product.price, 2);
                }

            });
            this.factura.subTotal = this.factura.subTotalIva12 + this.factura.subTotalIva0;
            this.factura.importeTotal = precisionRound(this.factura.subTotal + this.factura.iva12Total, 2);
            this.exitenProductosSeleccionados = true;
        }
    }


    calcularSubtotalComplex(amount: number) {
        this.factura.subTotal = precisionRound(amount, 2);
        let valorIva: number = this.IVA0 * this.factura.subTotal;
        this.factura.iva0Total = valorIva;
        if (this.factura && this.factura.subTotal > 0) {
            if (this.aplicarIva12) {
                valorIva = precisionRound(this.IVA12 * this.factura.subTotal, 2);
                this.factura.iva12Total = valorIva;
            }
            this.factura.importeTotal = precisionRound(this.factura.subTotal + valorIva, 2);
        } else {
            this.initVariables();
            this.uiService.presentToastSeverity("warning", "Monto a facturar no válido.");
        }
    }

    /**
    ** Utilitarios
    */
    registrarSubtotal(event: any) {
        this.factura.subTotal = Number(event.target.value);
        this.recalcularSubtotal(null);
    }

    recalcularSubtotal(event: any) {
        if (this.factura.subTotal && this.factura.subTotal > 0) {
            this.calcularTotal(this.factura.subTotal);
        } else if (this.factura.importeTotal > 0) {
            this.calcularTotal(0);
        }
    }

    calcularTotal(amount: number) {
        this.factura.subTotalIva12 = precisionRound(amount, 2);
        this.factura.subTotal = this.factura.subTotalIva12;
        let valorIva: number = this.IVA0 * this.factura.subTotal;
        if (this.factura && this.factura.subTotal > 0) {
            if (this.aplicarIva12) {
                valorIva = precisionRound(this.IVA12 * this.factura.subTotal, 2);
                this.factura.iva12Total = valorIva;
            }
            this.factura.importeTotal = precisionRound(this.factura.subTotal + valorIva, 2);
        } else {
            this.initVariables();
            this.uiService.presentToastSeverity("error", "Monto a facturar no válido.");
        }
    }

    initVariables() {
        this.factura.iva12Total = 0.00;
        this.factura.importeTotal = 0;
    }

    onSelectOption(event) {
        let value = event.target.value;
        if (value) {
            this.factura.estab = value;
        }
    }

    radioGroupChange(event) {
        if (event) {
            this.factura.estab = event.detail.value;
        }
    }

}
