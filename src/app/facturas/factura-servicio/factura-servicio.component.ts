import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Message, MessageService } from 'primeng/api';

import { UIService, User, UserService } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { ActionSheetController, AlertController, LoadingController, MenuController, ModalController, NavController } from '@ionic/angular';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { FacturaPopupComponent } from '../factura-popup/factura-popup.component';
import { ComprobantesService } from 'src/app/services/comprobantes.service';
import { AppComponent } from 'src/app/app.component';
import { DomSanitizer } from '@angular/platform-browser';

import * as moment from 'moment';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

import { environment } from "src/environments/environment";
import { FacturasInvalidasPopupComponent } from '../facturas-invalidas-popup/facturas-invalidas-popup.component';

@Component({
    selector: 'app-factura-servicio',
    templateUrl: './factura-servicio.component.html',
    styleUrls: ['./factura-servicio.component.scss']
})
export class FacturaServicioComponent implements OnInit {

    //Autenticación
    isAuthenticated: boolean;
    tags: Array<string> = [];
    tagsLoaded = false;
    currentUser: User;

    //Data
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

    msgs: Message[] = [];

    app: AppComponent;

    valido: boolean = false;
    tieneFacturas: boolean = false;
    tieneFacturasRecibidas: boolean = false;

    facturasInvalidas: Invoice[] = [];
    tieneFacturasIvalidas: boolean = false;

    enabledTotals: boolean = false;

    constructor(
        private router: Router,
        public userService: UserService,
        private comprobantesService: ComprobantesService,
        private messageService: MessageService,
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
            if (this.currentUser.initials && this.currentUser.initials == 'RUC NO VALIDO') {
            } else {
                this.valido = true;
                this.cargarDatosRelacionados();
            }
        });
    }

    doRefresh(event) {
        console.log('Begin async operation');
        this.cargarDatosRelacionados();
        setTimeout(() => {
            console.log('Async operation has ended');
            event.target.complete();
        }, 2000);
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

        //Facturas enviadas
        this.facturas = await this.getComprobantesPorUsuarioConectado();
        this.facturas.forEach((element) => {
            if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 16) {
                element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
            } else {
                element.fechaEmision = moment(element.emissionOn.toString()).calendar();
            }
        });
        this.tieneFacturas = this.facturas.length > 0; //Para mostrar el buscador si hay en que buscar

        this.facturasRecibidas = await this.getComprobantesParaUsuarioConectado();
        this.facturasRecibidas.forEach((element) => {
            if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 2) {
                element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
            } else {
                element.fechaEmision = moment(element.emissionOn.toString()).calendar();
            }
        });
        this.tieneFacturasRecibidas = this.facturasRecibidas.length > 0; //Para mostrar el buscador si hay en que buscar

        this.facturasInvalidas = await this.getComprobantesRechazadosPorUsuarioConectado();
        this.facturasInvalidas.forEach((element) => {
            if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 2) {
                element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
            } else {
                element.fechaEmision = moment(element.emissionOn.toString()).calendar();
            }
        });
        this.tieneFacturasIvalidas = this.facturasInvalidas.length > 0;

        this.facturasFiltrados = this.facturas;

        setTimeout(() => {
            loading.dismiss();
        });
    }

    getComprobantesPorUsuarioConectado(): Promise<any> {
        //return this.comprobantesService.getComprobantesPorUsuarioConectado('factura').toPromise();
        return this.comprobantesService.getFacturasEmitidasPorUsuarioConectado().toPromise();
    }

    getComprobantesPorUsuarioConectadoYEstado(estado: string): Promise<any> {
        return this.comprobantesService.getFacturasEmitidasPorUsuarioConectadoYEstado(estado).toPromise();
    }

    getComprobantesRechazadosPorUsuarioConectado(): Promise<any> {
        //return this.comprobantesService.getComprobantesPorUsuarioConectado('factura').toPromise();
        return this.comprobantesService.getFacturasEmitidasRechazadasPorUsuarioConectado().toPromise();
    }

    getComprobantesParaUsuarioConectado(): Promise<any> {
        return this.comprobantesService.getFacturasRecibidasPorUsuarioConectado().toPromise();
    }

    getDifferenceInDays(date1, date2) {
        const diffInMs = Math.abs(date2 - date1);
        return diffInMs / (1000 * 60 * 60 * 24);
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
                this.facturas = await this.getComprobantesPorUsuarioConectado();
                this.navCtrl.navigateRoot('facturas');
            }
            if (modalDataResponse && modalDataResponse.data) {
                this.facturas = await this.getComprobantesPorUsuarioConectado();
            } else {
                this.facturasInvalidas = await this.getComprobantesRechazadosPorUsuarioConectado();
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
                'facturas': this.facturasInvalidas,
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
                    text: 'Notificar',
                    role: 'destructive',
                    icon: 'send',
                    cssClass: 'primary',
                    handler: () => {
                        console.log('Notificar factura');
                        const tipo = "facturas";
                        const url = `${environment.settings.apiServer}/comprobantes/${tipo}/${factura.claveAcceso}/notificar`

                        this.notificarFactura(factura);
                        //                        //Popup para imprimir factura
                        //                        this.fileOpener.showOpenWithDialog(url, 'application/pdf')
                        //                            .then(() => console.log('File is opened'))
                        //                            .catch(e => console.log('Error opening file', e));

                    }
                }, {
                    text: 'Compartir',
                    icon: 'share-social',
                    handler: async () => {
                        const tipo = "facturas";
                        const title = `Hola te saluda ${this.currentUser.nombre}, adjunto factura ${factura.secuencial}`
                        const summary = `${title}. Que grato servirte con ${factura.resumen} por un monto de ${factura.importeTotal.toFixed(2)}. Fecha de emisión ${factura.fechaEmision}`
                        const url = `${environment.settings.apiServer}/comprobantes/${tipo}/${factura.claveAcceso}/archivos/pdf`
                        this.app.sendShare(summary, title, url);
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
    
    emitirFactura(event){
    console.log("emitirFactura");
    }

    /**
    ** Utilitarios
    */
    async onFilterItemsPorEstadoDef(event, estado: string) {
        if (event) {
            if (event.target.checked && estado == 'CREATED') {
                this.onFilterItemsPorEstado(null, estado);
            } else {
                this.onFilterItemsPorEstado(null, null);
            }
        }
    }

    async onFilterItemsPorEstado(event, estado: string) {
        this.facturasFiltrados = [];
        
        const loading = await this.loadingController.create({
            message: 'Por favor espere...',
            cssClass: 'my-loading-class',
        });
        await loading.present();
        //Facturas enviadas
        if (!estado) {
            this.facturas = await this.getComprobantesPorUsuarioConectado();
        } else {
            this.facturas = await this.getComprobantesPorUsuarioConectadoYEstado(estado);
            if (!this.facturas || (this.facturas && !this.facturas.length)) {
                this.uiService.presentToastSeverity("warning", "No se encontraron facturas para EMITIR SRI.");
            }
        }
        if (this.facturas && this.facturas.length) {
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
        setTimeout(() => {
            loading.dismiss();
        });
    }

    viewTotals(event) {
        this.enabledTotals = !this.enabledTotals;
    }

    onFilterItems(event) {
        let query = event.target.value;
        if (query && query.length > 2 && query.length < 6) {
            this.facturasFiltrados = this.buscarItemsFiltrados(this.facturas, query.trim(), 'emitted');
        } else {
            if (!query) {
                this.facturasFiltrados = this.facturas;
            }
        }
    }

    onFilterItemsReceived(event) {
        let query = event.target.value;
        if (query && query.length > 2 && query.length < 6) {
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
                            header: '¡FACTURA VÁLIDA!',
                            message: 'La factura ha sido validada con éxito por El SRI.',
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
                    err["type"] ? err["type"] : 'ERROR INTERNO DE SERVIDOR',
                    err["message"] ? err["message"] : 'Por favor revise los datos e inténte nuevamente.');
            }
        );
    }
}
