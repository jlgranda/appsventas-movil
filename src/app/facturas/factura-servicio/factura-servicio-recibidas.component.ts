import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UIService, User, UserService } from 'src/app/core';
import { Invoice } from 'src/app/modelo/Invoice';
import { ActionSheetController, AlertController, LoadingController, MenuController, ModalController, NavController } from '@ionic/angular';
import { FacturaPopupComponent } from '../factura-popup/factura-popup.component';
import { ComprobantesService } from 'src/app/services/comprobantes.service';
import { AppComponent } from 'src/app/app.component';

import * as moment from 'moment';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

import { environment } from "src/environments/environment";
import { FacturasInvalidasPopupComponent } from '../facturas-invalidas-popup/facturas-invalidas-popup.component';
import { InvoiceGlobal } from 'src/app/modelo/InvoiceGlobal';
import { FacturaSriPopupComponent } from '../factura-sri-popup/factura-sri-popup.component';

@Component({
    selector: 'app-factura-servicio-recibidas',
    templateUrl: './factura-servicio-recibidas.component.html',
    styleUrls: ['./factura-servicio.component.scss']
})
export class FacturaServicioRecibidasComponent implements OnInit {

    //Autenticación
    isAuthenticated: boolean;
    tags: Array<string> = [];
    tagsLoaded = false;
    currentUser: User;

    //Data
    invoiceGlobal: InvoiceGlobal = new InvoiceGlobal();
    internalStatusInvoiceCountTotal: number = 0;
    facturas: Invoice[] = [];
    facturasFiltrados: Invoice[] = [];
    facturasExistencia: boolean = false;
    facturasRecibidas: Invoice[] = [];
    facturasRecibidasFiltrados: Invoice[] = [];
    facturasRecibidasExistencia: boolean = false;

    sortOrder: number;
    sortField: string;

    //Auxiliares
    keyword: string;
    keywordReceived: string;

    tieneFacturas: boolean = false;
    tieneFacturasRecibidas: boolean = false;
    valido: boolean = false;
    enabledTotals: boolean = false;

    app: AppComponent;

    process: boolean = false;

    constructor(
        private router: Router,
        public userService: UserService,
        private comprobantesService: ComprobantesService,
        private menu: MenuController,
        private modalController: ModalController,
        private appController: AppComponent,
        private actionSheetController: ActionSheetController,
        private uiService: UIService,
        private navCtrl: NavController,
        private fileOpener: FileOpener,
        private alertController: AlertController,
        private loadingController: LoadingController,
    ) {
        this.app = appController;
        moment.locale('es');
    }

    ngOnInit() {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            if (this.currentUser) {
                let imagen = this.app.sanitize(this.currentUser.image);
                this.currentUser.image = typeof (imagen) == 'string' ? imagen : null;
                if (this.currentUser.initials && this.currentUser.initials != 'RUC NO VALIDO') {
                    this.valido = true;
                    this.cargarDatosRelacionados();
                }
            }
        });
    }

    doRefresh(event) {
        this.cargarDatosRelacionados();
        setTimeout(() => {
            event.target.complete();
        }, 50);
    }

    async cargarDatosRelacionados() {
        const loading = await this.loadingController.create({
            message: 'Por favor espere...',
            cssClass: 'my-loading-class',
        });
        await loading.present();

        if (this.currentUser.initials == "RUC NO VALIDO") {
            setTimeout(() => {
                loading.dismiss();
            });
            return;
        }

        //await this.cargarDatosFacturasEnviadas();
        await this.cargarDatosFacturasRecibidas();
        //await this.cargarDatosFacturasEnviadasRecibidas();

        await setTimeout(() => {
            loading.dismiss();
        });
    }

    getComprobantesPorUsuarioConectado(): Promise<any> {
        return this.comprobantesService.getFacturasEmitidasPorUsuarioConectado().toPromise();
    }

    getComprobantesPorUsuarioConectadoYEstado(estado: string): Promise<any> {
        return this.comprobantesService.getFacturasEmitidasPorUsuarioConectadoYEstado(estado).toPromise();
    }

    getComprobantesRechazadosPorUsuarioConectado(): Promise<any> {
        return this.comprobantesService.getFacturasEmitidasRechazadasPorUsuarioConectado().toPromise();
    }

    getComprobantesParaUsuarioConectado(): Promise<any> {
        return this.comprobantesService.getFacturasRecibidasPorUsuarioConectado().toPromise();
    }

    getComprobantesEnviadasRecibidasPorUsuarioConectado(): Promise<any> {
        return this.comprobantesService.getComprobantesEnviadasRecibidasPorUsuarioConectado().toPromise();
    }

    async cargarDatosFacturasEnviadas() {
        this.internalStatusInvoiceCountTotal = 0;
        this.invoiceGlobal = await this.getComprobantesPorUsuarioConectado();
        if (this.invoiceGlobal) {
            if (this.invoiceGlobal.invoicesData) {
                this.facturas = this.invoiceGlobal.invoicesData;
            }
            if (this.invoiceGlobal.invoicesCountData) {
                this.invoiceGlobal.invoicesCountData.forEach(element => {
                    this.internalStatusInvoiceCountTotal = this.internalStatusInvoiceCountTotal + element['count'];
                });
            }
        }

        //Facturas enviadas
        this.facturas.forEach((element) => {
            if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 16) {
                element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
            } else {
                element.fechaEmision = moment(element.emissionOn.toString()).calendar();
            }
        });

        this.tieneFacturas = this.facturas.length > 0; //Para mostrar el buscador si hay en que buscar
        this.facturasFiltrados = this.facturas;
    }

    async cargarDatosFacturasRecibidas() {
        this.facturasRecibidas = await this.getComprobantesParaUsuarioConectado();
        this.facturasRecibidas.forEach((element) => {
            if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 2) {
                element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
            } else {
                element.fechaEmision = moment(element.emissionOn.toString()).calendar();
            }
        });
        this.tieneFacturasRecibidas = this.facturasRecibidas.length > 0; //Para mostrar el buscador si hay en que buscar
        this.facturasRecibidasFiltrados = this.facturasRecibidas;
    }

    async cargarDatosFacturasEnviadasRecibidas() {
        this.process = true;
        this.internalStatusInvoiceCountTotal = 0;
        this.invoiceGlobal = await this.getComprobantesEnviadasRecibidasPorUsuarioConectado();
        if (this.invoiceGlobal) {
            if (this.invoiceGlobal.invoicesEmitidasData) {
                this.facturas = this.invoiceGlobal.invoicesEmitidasData;
            }
            if (this.invoiceGlobal.invoicesEmitidasCountData) {
                this.invoiceGlobal.invoicesEmitidasCountData.forEach(element => {
                    this.internalStatusInvoiceCountTotal = this.internalStatusInvoiceCountTotal + element['count'];
                });
            }
        }
        //Facturas enviadas
        this.facturas.forEach((element) => {
            if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 16) {
                element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
            } else {
                element.fechaEmision = moment(element.emissionOn.toString()).calendar();
            }
        });

        this.tieneFacturas = this.facturas.length > 0; //Para mostrar el buscador si hay en que buscar
        this.facturasFiltrados = this.facturas;

        //Facturas recibidas
        this.facturasRecibidas = this.invoiceGlobal.invoicesRecibidasData;
        this.facturasRecibidas.forEach((element) => {
            if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 2) {
                element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
            } else {
                element.fechaEmision = moment(element.emissionOn.toString()).calendar();
            }
        });
        this.tieneFacturasRecibidas = this.facturasRecibidas.length > 0; //Para mostrar el buscador si hay en que buscar
        this.facturasRecibidasFiltrados = this.facturasRecibidas;
        this.process = false;
    }

    async irAPopupFactura(event, factura: Invoice) {
        if (!factura) {
            factura = new Invoice();
            factura.enviarSRI = true;
        }
        const modal = await this.modalController.create({
            component: FacturaPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-class',
            componentProps: {
                'factura': factura,
            }
        });

        modal.onDidDismiss().then(async (modalDataResponse) => {
            if (this.router.url != '/facturas') {
                this.navCtrl.navigateRoot('facturas');
            }
            if (modalDataResponse && modalDataResponse.data) {
                await this.cargarDatosFacturasEnviadas();
            }
        });

        return await modal.present();
    }

    async irAPopupFacturasInvalidas(event) {
        const modal = await this.modalController.create({
            component: FacturasInvalidasPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-class',
            componentProps: {
                'invoicesCountData': this.invoiceGlobal.invoicesEmitidasCountData,
            }
        });

        modal.onDidDismiss().then(async (modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
            }
        });

        return await modal.present();
    }

    async presentarOpcionesActionSheet(event, factura: Invoice) {
        const actionSheet = await this.actionSheetController.create({
            header: 'OPCIONES',
            cssClass: 'my-actionsheet-class',
            buttons: [
                {
                    text: 'Cancelar',
                    icon: 'close',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancelar');
                    }
                }
            ]
                
        });
        await actionSheet.present();

        const { role, data } = await actionSheet.onDidDismiss();
    }

    async confirmarPagoFactura(f: Invoice) {
        const alert = await this.alertController.create({
            cssClass: 'my-alert-class',
            header: 'Confirmación!',
            message: '¿Está seguro de realizar esta acción?',
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
                        this.guardarPagoFactura(f);
                    }
                }
            ]
        });

        await alert.present();
    }

    async guardarPagoFactura(factura: Invoice) {
        const loading = await this.loadingController.create({
            message: 'Procesando factura...',
            cssClass: 'my-loading-class',
        });
        await loading.present();

        if (factura && factura.id && factura.importeTotal) {
            //Guardar en persistencia
            this.comprobantesService.enviarFacturaPago(factura).subscribe(
                async (data) => {
                    setTimeout(() => {
                        loading.dismiss();
                    });
                    this.uiService.presentToastSeverity("success", "Factura marcada como ya pagada.");
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
        }
    }

    async irAPopupFacturaSri(event, factura: Invoice) {
        const modal = await this.modalController.create({
            component: FacturaSriPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-popup-two-class',
            componentProps: {
                'factura': factura,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.cargarDatosFacturasEnviadas();
            }
        });

        return await modal.present();
    }

    /**
    ** Utilitarios
    */
    getDifferenceInDays(date1, date2) {
        const diffInMs = Math.abs(date2 - date1);
        return diffInMs / (1000 * 60 * 60 * 24);
    }

    viewTotals(event) {
        this.enabledTotals = !this.enabledTotals;
    }

    onFilterItems(event) {
        this.process = true;
        let query = event.target.value;
        if (query && query.length > 3 && query.length < 6) {
            this.facturasFiltrados = this.buscarItemsFiltrados(this.facturas, query.trim(), 'emitted');
            this.process = false;
        } else {
            if (!query) {
                this.facturasFiltrados = this.facturas;
            }
            this.process = false;
        }
    }

    onFilterItemsReceived(event) {
        let query = event.target.value;
        if (query && query.length > 3 && query.length < 6) {
            this.facturasRecibidasFiltrados = this.buscarItemsFiltrados(this.facturasRecibidas, query.trim(), 'received');
        } else {
            if (!query) {
                this.facturasRecibidasFiltrados = this.facturasRecibidas;
            }
        }
    }

    buscarItemsFiltrados(items, query, camp): any[] {
        let filters = [];
        if (items && items.length) {
            filters = items.filter(val =>
                (camp == 'emitted' && val.customerFullName && val.customerFullName.toLowerCase().includes(query.toLowerCase()))
                || (camp == 'received' && val.subjectFullName && val.subjectFullName.toLowerCase().includes(query.toLowerCase()))
            );
        }
        return filters;
    }

    openFirst() {
        this.menu.enable(true, 'first');
        this.menu.open('first');
    }

    openEnd() {
        this.menu.open('end');
    }

    openCustom() {
        this.menu.enable(true, 'custom');
        this.menu.open('custom');
    }

    async notificarFactura(factura: Invoice) {
        const loading = await this.loadingController.create({
            message: 'Notificando factura...',
            cssClass: 'my-loading-class',
        });
        await loading.present();
        //Guardar la factura en persistencia para luego recargar las facturas
        this.comprobantesService.notificarFactura("facturas", factura).subscribe(
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
                                            await this.modalController.dismiss(null);
                                        } else {
                                            //Enviar la información de la factura y lo correspondiente
                                            await this.modalController.dismiss(factura);
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
                            header: '¡Bien! Factura autorizada',
                            message: 'La factura fue autorizada por SRI',
                            buttons: [
                                {
                                    text: 'OK',
                                    role: 'cancel',
                                    handler: async () => {
                                        await this.modalController.dismiss(factura);
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
    }
}
