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


    //Variables con objeto de edición
    currentUser: User;
    facturasRecibidas: Invoice[] = [];
    facturasRecibidasFiltrados: Invoice[] = [];
    facturasRecibidasExistencia: boolean = false;

    //Auxiliares
    keywordReceived: string;
    process: boolean = true;
    tieneFacturasRecibidas: boolean = false;
    valido: boolean = false;
    enabledTotals: boolean = false;
    app: AppComponent;

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
        this.process = true;
        this.app = appController;
        moment.locale('es');
    }

    ngOnInit() {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData['user'] ? userData['user'] : userData;
            if (this.currentUser && this.currentUser.uuid) {
                let imagen = this.app.sanitize(this.currentUser.image);
                this.currentUser.image = typeof (imagen) == 'string' ? imagen : null;
                if (this.currentUser.initials && this.currentUser.initials != 'RUC NO VALIDO') {
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
        this.process = true;
        await this.cargarDatosFacturasRecibidas();
    }

    async cargarDatosFacturasRecibidas() {
        this.process = true;
        this.facturasRecibidas = [];
        this.facturasRecibidas = await this.comprobantesService.getComprobantesParaUsuarioConectadoData();
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

    onFilterItemsReceived(event) {
        this.process = true;
        let query = event.target.value;
        if (query && query.length > 3) {
            this.facturasRecibidasFiltrados = this.buscarItemsFiltrados(this.facturasRecibidas, query.trim(), 'received');
        } else {
            if (!query) {
                this.facturasRecibidasFiltrados = this.facturasRecibidas;
                this.process = false;
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
        this.process = false;
        return filters;
    }

}
