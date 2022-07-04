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
    details: InvoiceDetail[];
    subjectCustomer: SubjectCustomer;
    product: Product;

    //UX
    isUnitDetail: boolean = true;
    exitenProductosSeleccionados: boolean = false;
    aplicarIva12: boolean = false;
    IVA12: number = 0.12;
    IVA0: number = 0.00;
    listLocal: any[] = [];

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

        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData['user'] ? userData['user'] : userData;
            this.cargarDataInit();
        });

    }

    resetVariables() {
        //Encerar objetos
        this.subjectCustomer = new SubjectCustomer();
        this.product = new Product();
    }

    resetSumadores() {
        //Encerar sumadores
        this.factura.descuento = 0.00;
        this.factura.propina = 0.00;
        this.factura.subTotalIva12 = 0.00;
        this.factura.subTotalIva0 = 0.00;
        this.factura.iva12Total = 0.00;
        this.factura.iva0Total = 0.00;
        this.factura.importeTotal = 0.00;
    }

    resetSumadoresAll() {
        this.factura.subTotal = 0.00;
        this.resetSumadores();
    }

    cargarDataInit() {

        this.resetVariables();
        this.listLocal = this.cargarEstablecimientos();
        this.factura.estab = (this.listLocal && this.listLocal.length) ? this.listLocal[0].value : null;

        if (this.factura) {

            this.details = this.factura.details ? this.factura.details : [];

            if (this.factura.subjectCustomer) {
                this.subjectCustomer = this.factura.subjectCustomer;
                this.factura.subjectCustomer = new SubjectCustomer();
            }

            if (this.factura.product && this.factura.product.id) {
                this.agregarProductoSeleccionado(this.factura.product);
                this.factura.product = new Product();
            }

            this.isUnitDetail = this.verificarSimpleComplex();

            this.generarFacturaSimpleComplex();
        }

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

        //Establecer valores UX
        this.subjectCustomer.customerPhoto = "";//remover foto
        this.factura.details = this.details; //Los detalles de la factura
        this.factura.subjectCustomer = this.subjectCustomer;
        this.factura.emissionOn = this.factura.emissionOn ? this.factura.emissionOn : new Date();
        
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
    * Ir a seleccionar Servicio
    */
    async irAPopupServicios(event) {
        const modal = await this.modalController.create({
            component: ServiciosPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-class',
            componentProps: {
                'details': this.details,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.details = modalDataResponse.data;
                this.isUnitDetail = this.verificarSimpleComplex();
                this.generarFacturaSimpleComplex();
            }
        });

        return await modal.present();
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
    ** Utilitarios
    */
    cargarEstablecimientos() {

        let list: any[] = [];
        let item: any;
        var localVal = "";
        if (this.currentUser.organization && this.currentUser.organization.numeroLocales) {
            for (let i = 1; i <= this.currentUser.organization.numeroLocales; i++) {
                localVal = '00' + i;
                item = { name: localVal, value: localVal };
                list.push(item);
            }
        } else {
            localVal = '001';
            item = { name: localVal, value: localVal };
            list.push(item);
        }

        return list;
    }

    agregarProductoSeleccionado(p: Product) {
        let detail: InvoiceDetail = new InvoiceDetail();
        detail.product = this.factura.product;
        detail.amount = detail.product.amount;
        this.agregarDetail(detail);
    }


    agregarDetail(newDetail: InvoiceDetail) {
        if (newDetail.amount > 0) {
            this.addDetail(newDetail);
        } else {
            this.removeDetail(newDetail);
        }
    }

    addDetail(newDetail: InvoiceDetail) {
        if (this.details && this.details.length) {
            let d = this.details.find(item => item.product.id == newDetail.product.id);
            if (d) {
                this.details[this.details.indexOf(d)] = newDetail;
            } else {
                this.details.unshift(newDetail);
            }
        } else {
            this.details.unshift(newDetail);
        }
    }

    removeDetail(newDetail: InvoiceDetail) {
        if (this.details && this.details.length) {
            const indexOfObject = this.details.indexOf(newDetail);
            this.details.splice(indexOfObject, 1);
        } else {
            this.details = [];
        }
    }

    verificarSimpleComplex() {

        if (!this.details || this.details.length == 0) {
            return true;
        } else if (this.details.length == 1 && this.details[0].amount == 1) {
            return true;
        } else {
            return false;
        }
    }

    generarFacturaSimpleComplex() {
        if (this.details && this.details.length > 0) {
            if (this.isUnitDetail) {
                this.generarFacturaSimple(this.details[0]);
            } else {
                this.generarFacturaComplex();
            }
        }
        this.resetSumadoresAll();
        this.calcularTotalesFactura();//En función de sus detalles
    }

    generarFacturaSimple(detail: InvoiceDetail) {
        this.product = detail.product; //Cargar el producto único
        this.exitenProductosSeleccionados = this.product != null;
        this.uiService.presentToastSeverity("info", `Facturar por concepto de ${this.product.name}`);
    }

    generarFacturaComplex() {
        this.exitenProductosSeleccionados = false;
        if (this.details && this.details.length) {
            this.exitenProductosSeleccionados = true;
        }
    }

    calcularTotalesFactura() {
        if (this.details && this.details.length) {
            this.details.forEach(detail => {
                let subtotal = detail.amount * detail.product.price;
                if (detail.product.taxType == 'IVA') {
                    this.factura.subTotalIva12 = this.factura.subTotalIva12 + precisionRound(subtotal, 2);
                    this.factura.iva12Total = this.factura.iva12Total + precisionRound(subtotal * (detail.product.taxFactor / 100), 2);
                } else {
                    this.factura.subTotalIva0 = this.factura.subTotalIva0 + precisionRound(subtotal, 2);
                }
            });
            this.factura.subTotal = this.factura.subTotalIva12 + this.factura.subTotalIva0;
            this.factura.importeTotal = precisionRound(this.factura.subTotal + this.factura.iva12Total, 2);
        }
    }

    calcularConSubtotalPersonalizado(event: any) {
        if (this.product && this.product.id) {//Buscar producto al cual se ha cambiado el precio para cambiar su precio
            let detail: InvoiceDetail = new InvoiceDetail();
            detail.product = this.product;
            detail.product.price = Number(event.target.value);
            detail.amount = 1;
            this.agregarDetail(detail);
        }
        this.resetSumadores();
        this.calcularTotalesFactura();
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
