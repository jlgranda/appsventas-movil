import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { User, UserService } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { MenuController, ModalController } from '@ionic/angular';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { FacturaPopupComponent } from '../factura-popup/factura-popup.component';
import { ComprobantesService } from 'src/app/services/comprobantes.service';

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
    factura: Invoice = new Invoice();
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
        { field: 'emissionOn', header: 'Fecha de Emisión' },
    ];
    keyword: string;
    keywordReceived: string;

    constructor(
        private router: Router,
        public userService: UserService,
        private comprobantesService: ComprobantesService,
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
       //TODO llenar facturas recibidas
       //TODO llenar facturas emitidas
       this.facturasRecibidas = await this.getComprobantesPorUsuarioConectado();
    }

    getComprobantesPorUsuarioConectado(): Promise<any> {
        return this.comprobantesService.getComprobantesPorUsuarioConectado('factura').toPromise();
    }

    onFilterItems(event) {
        console.log("onFilterItems");
    }

    onFilterItemsReceived(event) {
        console.log("onFilterItemsReceived");
    }

    async irAFacturaPopup(event, f: Invoice) {
        let facturaNueva = new Invoice();
        if (f) {
            facturaNueva = f;
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
                console.log('modalDataResponseFactura:::', modalDataResponse.data);
                if (modalDataResponse.data) {
                    //Guardar la factura en persistencia para luego recargar las facturas
                    //this.facturas.push(modalDataResponse.data);
                    this.factura = modalDataResponse.data;
                    this.comprobantesService.enviarFactura(this.factura).subscribe(
                        async (data) => {
                            this.facturas.push(data);
                            //this.facturas = await this.getComprobantesPorUsuarioConectado();
                            this.messageService.add({ severity: 'success', summary: "¡Bien!", detail: `Se registró la factura con éxito.` });
                            this.factura = new Invoice(); //Listo para una nueva factura
                        },
                        (err) => {
                            this.messageService.add({ severity: 'error', summary: "Error", detail: err });
                        }
                    );
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
