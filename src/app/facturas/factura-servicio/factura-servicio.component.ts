import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { User, UserService } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { LoadingController, MenuController, ModalController } from '@ionic/angular';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { FacturaPopupComponent } from '../factura-popup/factura-popup.component';
import { ComprobantesService } from 'src/app/services/comprobantes.service';
import { AppComponent } from 'src/app/app.component';
import { DomSanitizer } from '@angular/platform-browser';

import * as moment from 'moment';

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

    app: AppComponent;

    constructor(
        private router: Router,
        public userService: UserService,
        private comprobantesService: ComprobantesService,
        private messageService: MessageService,
        private menu: MenuController,
        private modalController: ModalController,
        private appController: AppComponent,
        private loadingController: LoadingController,
    ) {
        this.app = appController;
        moment.locale('es');
    }

    ngOnInit() {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            if (this.currentUser && this.currentUser.uuid) {
                this.cargarDatosRelacionados();
            }
        });
    }

    async cargarDatosRelacionados() {
        
        if (this.currentUser.initials == "RUC NO VALIDO"){
            return;
        }
        
        const loading = await this.loadingController.create({
            cssClass: 'my-loading-class',
            message: 'Por favor espere...',
        });
        await loading.present();

        this.facturas = await this.getComprobantesPorUsuarioConectado();
        this.facturas.forEach((element) => {
            if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 16) {
                element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
            } else {
                element.fechaEmision = moment(element.emissionOn.toString()).calendar();
            }
        });
        this.facturasRecibidas = await this.getComprobantesParaUsuarioConectado();
        this.facturasRecibidas.forEach((element) => {
            if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 16) {
                element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
            } else {
                element.fechaEmision = moment(element.emissionOn.toString()).calendar();
            }
        });
        this.facturasFiltrados = this.facturas;
        this.facturasExistencia = this.facturas.length ? true : false;
        this.facturasRecibidasFiltrados = this.facturasRecibidas;
        this.facturasRecibidasExistencia = this.facturasRecibidas.length ? true : false;

        setTimeout(() => {
            loading.dismiss();
        });
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

    async irAPopupFactura(event, f: Invoice) {
        if (!f) {
            f = new Invoice();
        }
        const modal = await this.modalController.create({
            component: FacturaPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-custom-class',
            componentProps: {
                'factura': f,
            }
        });

        modal.onDidDismiss().then(async (modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                //Guardar la factura en persistencia para luego recargar las facturas
                this.comprobantesService.enviarFactura(modalDataResponse.data).subscribe(
                    async (data) => {
                        this.facturas = await this.getComprobantesPorUsuarioConectado();
                        this.messageService.add({ severity: 'success', summary: "¡Bien!", detail: `Se registró la factura con éxito.` });
                    },
                    (err) => {
                        this.messageService.add({ severity: 'error', summary: "Error", detail: err });
                    }
                );
            }
        });

        return await modal.present();
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
