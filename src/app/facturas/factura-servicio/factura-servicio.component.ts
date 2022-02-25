import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { User, UserService } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { FacturacionService } from 'src/app/services/facturacion.service';
import { MenuController } from '@ionic/angular';

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
    products: Product[] = [];
    sortOrder: number;
    sortField: string;
    facturas: Invoice[] = [];
    facturasSeleccionadas: Invoice[] = [];
    factura: Invoice = new Invoice();
    facturaDetalle: InvoiceDetail = new InvoiceDetail();
    cols = [
        { field: 'clienteNombre', header: 'Cliente' },
        { field: 'importeTotal', header: 'Total' },
        { field: 'fechaEmision', header: 'Fecha de Emisión' },
    ];
    mostrarEditorFactura: boolean = false;

    clientes: Subject[] = [];
    clientesFiltrados: Subject[] = [];

    productoSeleccionado: Product;
    
    //Auxiliares
    keyword: string;

    constructor(
        private router: Router,
        public userService: UserService,
        private facturacionService: FacturacionService,
        private messageService: MessageService,
        private menu: MenuController
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
                    //                    this.router.navigateByUrl('/');
                    return;
                } else {
                    this.router.navigate(['']);
                }
            }
        );
        //
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            console.log("this.currentUser:::", this.currentUser);
            this.cargarDatosRelacionados();
        });

        console.log("//Fin InicioComponent...");
    }

    async cargarDatosRelacionados() {

        //Facturas
        let factura: Invoice = new Invoice();

        //Clientes
        let cliente: Subject = new Subject();
        cliente.name = 'Kelly Paulina Narváez Castillo';
        cliente.code = '1150458519';
        this.clientes.push(cliente);

        cliente = new Subject();
        cliente.name = 'José Luis Granda';
        cliente.code = '1103826960';
        this.clientes.push(cliente);

        cliente = new Subject();
        cliente.name = 'Juan Perez';
        cliente.code = '1150659845';
        this.clientes.push(cliente);

        //Productos
        let product = new Product();
        product.id = 1;
        product.name = 'Hora desarrollo Java';
        product.price = 2.00;
        product.image = 'gaming-set.jpg'
        product.category = 'Tecnología';
        this.products.push(product);

        product = new Product();
        product.id = 2;
        product.name = 'Hora soporte de contenidos';
        product.price = 3.0;
        product.image = 'gold-phone-case.jpg'
        product.category = 'Contenidos';
        this.products.push(product);

        //this.facturas = await this.getInvoicesPorUsuario();
    }

    private getInvoicesPorUsuario(): Promise<any> {
        return this.facturacionService.getInvoicesPorUsuario().toPromise();
    }

    public irAFacturacion(event) {
        this.router.navigate(['/factura']);
    }

    public agregarFactura(event, product: Product) {
        alert("TODO implementar el popup en ionic");
        this.productoSeleccionado = product;
        //this.mostrarEditorFactura = true;
    }

    public cancelarFactura() {
        this.mostrarEditorFactura = false;
        this.facturaDetalle = new InvoiceDetail();
    }

    public guardarFactura(form: any) {
        if (this.factura && this.factura.cliente) {
            this.messageService.add({ severity: 'success', summary: '¡Bien!', detail: 'Producto/Servicio facturado', life: 3000 });
            this.factura.clienteNombre = this.factura.cliente.name;
            this.factura.importeTotal = this.facturaDetalle.quantity * this.productoSeleccionado.price;
            this.facturas.push(this.factura);
        }

        this.facturas = [...this.facturas];
        this.mostrarEditorFactura = false;
        this.factura = new Invoice();
        this.productoSeleccionado = new Product();

    }

    public filtrarSubjects(event) {
        let filtered: any[] = [];
        let query = event.query;

        for (let i = 0; i < this.clientes.length; i++) {
            let item = this.clientes[i];
            if (item.code.toLowerCase().indexOf(query.toLowerCase()) >= 0
                || item.name.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
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
}
