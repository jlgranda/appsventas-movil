import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Message, MessageService } from 'primeng/api';

import { UIService, User, UserService } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { ActionSheetController, LoadingController, MenuController, ModalController, NavController } from '@ionic/angular';
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
        private fileOpener: FileOpener
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

    async cargarDatosRelacionados() {

        this.uiService.presentLoading(500);

        if (this.currentUser.initials == "RUC NO VALIDO") {
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
            if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 16) {
                element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
            } else {
                element.fechaEmision = moment(element.emissionOn.toString()).calendar();
            }
        });
        this.tieneFacturasRecibidas = this.facturasRecibidas.length > 0; //Para mostrar el buscador si hay en que buscar

        this.facturasInvalidas = await this.getComprobantesParaUsuarioConectado();
        this.facturasInvalidas.push(this.facturas[0]);
        this.facturasInvalidas.push(this.facturas[0]);
        this.facturasInvalidas.forEach((element) => {
            if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 16) {
                element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
            } else {
                element.fechaEmision = moment(element.emissionOn.toString()).calendar();
            }
        });
        this.tieneFacturasIvalidas = this.facturasInvalidas.length > 0;
        
        this.facturasFiltrados = this.facturas;
    }

    getComprobantesPorUsuarioConectado(): Promise<any> {
        //return this.comprobantesService.getComprobantesPorUsuarioConectado('factura').toPromise();
        return this.comprobantesService.getFacturasEmitidasPorUsuarioConectado().toPromise();
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
                this.facturas = await this.getComprobantesPorUsuarioConectado();
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
                console.log("modalDataResponse::: ", modalDataResponse.data);
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
                    text: 'Imprimir',
                    role: 'destructive',
                    icon: 'print',
                    cssClass: 'primary',
                    handler: () => {
                        console.log('Imprimir factura');
                        const tipo = "facturas";
                        const url = `${environment.settings.apiServer}/comprobantes/${tipo}/${factura.claveAcceso}/archivos/pdf`
                        //Popup para imprimir factura
                        this.fileOpener.showOpenWithDialog(url, 'application/pdf')
                            .then(() => console.log('File is opened'))
                            .catch(e => console.log('Error opening file', e));

                    }
                }, {
                    text: 'Compartir',
                    icon: 'share-social',
                    handler: async () => {
                        const tipo = "facturas";
                        const title = `Hola te saluda ${this.currentUser.nombre}, adjunto factura ${factura.secuencial}`
                        const summary = `Que grato servirte con ${factura.resumen} por un monto de ${factura.importeTotal.toFixed(2)}. Fecha de emisión ${factura.fechaEmision}`
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

    /**
    ** Utilitarios
    */
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

}
