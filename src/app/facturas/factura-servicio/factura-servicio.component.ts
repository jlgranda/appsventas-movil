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
    facturas: Invoice[] = [];
    facturasFiltrados: Invoice[] = [];
    facturasRecibidas: Invoice[] = [];
    facturasRecibidasFiltrados: Invoice[] = [];
    factura: Invoice = new Invoice();
    facturaDetalle: InvoiceDetail = new InvoiceDetail();

    clientes: SubjectCustomer[] = [];
    clientesFiltrados: SubjectCustomer[] = [];
    cliente: SubjectCustomer = new SubjectCustomer();
    productos: Product[] = [];
    productosFiltrados: Product[] = [];
    producto: Product = new Product();
    productoSeleccionado: Product;

    sortOrder: number;
    sortField: string;

    cols = [
        { field: 'clienteNombre', header: 'Cliente' },
        { field: 'importeTotal', header: 'Total' },
        { field: 'fechaEmision', header: 'Fecha de Emisión' },
    ];

    //Auxiliares
    keyword: string;
    mostrarEditorFactura: boolean = false;

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

    }

    getInvoicesPorUsuarioConectado(): Promise<any> {
        return this.comprobantesService.getComprobantesPorUsuarioConectado('factura').toPromise();
    }

    irAFacturacion(event) {
        this.router.navigate(['/factura']);
    }

    async irANuevaFactura(event, p: Product) {
        const modal = await this.modalController.create({
            component: FacturaPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            componentProps: {
                'factura': this.factura,
                'cliente': null,
                'producto': null,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            this.productoSeleccionado = null;
            if (modalDataResponse !== null) {
                this.factura = modalDataResponse.data;
                
                this.comprobantesService.enviarFactura(this.factura).subscribe((data) => {
                    this.facturas.push(data);
                    this.factura = new Invoice(); //Listo para una nueva factura
                    }
                );
            }
        });

        return await modal.present();
    }

    guardarFactura(form: any) {
        if (this.factura && this.factura.customer) {
            this.messageService.add({ severity: 'success', summary: '¡Bien!', detail: 'Producto/Servicio facturado', life: 3000 });
            this.factura.customerFullName = this.factura.customer.customerFullName;
            this.factura.importeTotal = this.facturaDetalle.quantity * this.productoSeleccionado.price;
            this.facturas.push(this.factura);
        }

        this.facturas = [...this.facturas];
        this.mostrarEditorFactura = false;
        this.factura = new Invoice();
        this.productoSeleccionado = new Product();

    }

    agregarFactura(event, product: Product) {
        alert("TODO implementar el popup en ionic");
        this.productoSeleccionado = product;
        //this.mostrarEditorFactura = true;
    }

    cancelarFactura() {
        this.mostrarEditorFactura = false;
        this.facturaDetalle = new InvoiceDetail();
    }

    filtrarSubjects(event) {
        let filtered: any[] = [];
        let query = event.query;

        for (let i = 0; i < this.clientes.length; i++) {
            let item = this.clientes[i];
            if (item.customerCode.toLowerCase().indexOf(query.toLowerCase()) >= 0
                || item.customerFullName.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                filtered.push(item);
            }
        }
        this.clientesFiltrados = filtered;
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

    onFilterItems(event) {
    }

    onFilterItemsReceived(event) {
    }
}
