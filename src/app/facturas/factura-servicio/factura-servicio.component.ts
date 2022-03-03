import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { User, UserService } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { FacturacionService } from 'src/app/services/facturacion.service';
import { MenuController, ModalController } from '@ionic/angular';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { FacturaPopupComponent } from '../factura-popup/factura-popup.component';

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
    facturasRecibidas: Invoice[] = [];
    facturasRecibidasFiltrados: Invoice[] = [];

    sortOrder: number;
    sortField: string;

    //Auxiliares
    cols = [
        { field: 'clienteNombre', header: 'Cliente' },
        { field: 'importeTotal', header: 'Total' },
        { field: 'fechaEmision', header: 'Fecha de Emisión' },
    ];
    keyword: string;
    keywordReceived: string;

    constructor(
        private router: Router,
        public userService: UserService,
        private facturacionService: FacturacionService,
        private messageService: MessageService,
        private menu: MenuController,
        private modalController: ModalController
    ) {
    }

    ngOnInit() {
        console.log("InicioComponent, preguntando por auth...");
        this.userService.isAuthenticated.subscribe(
            (authenticated) => {
                this.isAuthenticated = authenticated;
                // set the article list accordingly
                if (!this.isAuthenticated) {
                    this.router.navigate(['/login']);
                    //this.router.navigateByUrl('/');
                    return;
                } else {
                    this.router.navigate(['']);
                }
            }
        );

        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            this.cargarDatosRelacionados();
        });

    }

    async cargarDatosRelacionados() {

        //Facturas
        let factura: Invoice = new Invoice();
        factura.customerFullName = 'Kelly Paulina Narváez Castillo';
        factura.fechaEmision = new Date();
        factura.importeTotal = 10.50;
        this.facturas.push(factura);
        this.facturasRecibidas.push(factura);

        factura = new Invoice();
        factura.customerFullName = 'Juan Pérez';
        factura.fechaEmision = new Date();
        factura.importeTotal = 20.75;
        this.facturas.push(factura);
        this.facturasRecibidas.push(factura);
        let facturasXXX = this.getInvoicesPorUsuarioConectado();
        console.log(facturasXXX);
    }

    async getInvoicesPorUsuarioConectado(): Promise<any> {
        return this.facturacionService.getInvoicesPorUsuarioConectado().toPromise();
    }

    onFilterItems(event) {
        console.log("onFilterItems");
    }

    onFilterItemsReceived(event) {
        console.log("onFilterItemsReceived");
    }

    async irAFacturaPopup(event, factura: Invoice) {
        let facturaNueva = new Invoice();
        if (factura) {
            facturaNueva = factura;
        }
        const modal = await this.modalController.create({
            component: FacturaPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-custom-class',
            componentProps: {
                'factura': facturaNueva,
            }
        });

        modal.onDidDismiss().then(async (modalDataResponse) => {
            if (modalDataResponse != null) {
                console.log('modalDataResponse Factura:::', modalDataResponse.data);
                if (modalDataResponse.data) {
                    //this.facturas.push(modalDataResponse.data);
                    //Guardar la factura en persistencia para luego recargar las facturas
                    this.facturas = await this.getInvoicesPorUsuarioConectado();
                }
            }
        });

        return await modal.present();
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

    salir(evn: any) {
        this.userService.purgeAuth();
    }

}
