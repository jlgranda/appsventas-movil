import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';

@Component({
    selector: 'app-factura-popup',
    templateUrl: './factura-popup.component.html',
    styleUrls: ['./factura-popup.component.scss']
})
export class FacturaPopupComponent implements OnInit {

    @Input() factura: Invoice;

    facturaDetalle: InvoiceDetail = new InvoiceDetail();
    clientes: SubjectCustomer[] = [];
    clientesFiltrados: SubjectCustomer[] = [];
    cliente: SubjectCustomer = new SubjectCustomer();
    productos: Product[] = [];
    productosFiltrados: Product[] = [];

    constructor(
        private modalController: ModalController,
    ) { }

    ngOnInit(): void {
        //Clientes
        let cliente: SubjectCustomer = new SubjectCustomer();
        cliente.customerFullName = 'Kelly Paulina Narváez Castillo';
        cliente.customerCode = '1150458519';
        this.clientes.push(cliente);

        cliente = new SubjectCustomer();
        cliente.customerFullName = 'José Luis Granda';
        cliente.customerCode = '1103826960';
        this.clientes.push(cliente);

        cliente = new SubjectCustomer();
        cliente.customerFullName = 'Juan Perez';
        cliente.customerCode = '1150659845';
        this.clientes.push(cliente);

        //Productos
        let producto = new Product();
        producto.id = 1;
        producto.name = 'Hora desarrollo Java';
        producto.price = 2.00;
        producto.photo = 'gaming-set.jpg'
        producto.categoryName = 'Tecnología';
        this.productos.push(producto);

        producto = new Product();
        producto.id = 2;
        producto.name = 'Hora soporte de contenidos';
        producto.price = 3.0;
        producto.photo = 'gold-phone-case.jpg'
        producto.categoryName = 'Contenidos';
        this.productos.push(producto);
    }

    async close(event) {
        await this.modalController.dismiss(null);
    }

    async agregarFactura(form: any) {
        if (this.factura && this.factura.customer) {
            this.factura.customerFullName = this.factura.customer.customerFullName;
            this.factura.fechaEmision = new Date();
        }
        await this.modalController.dismiss(this.factura);
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
        this.clientesFiltrados = [...filtered];
    }

    filtrarProducts(event) {
        let filtered: any[] = [];
        let query = event.query;

        for (let i = 0; i < this.productos.length; i++) {
            let item = this.productos[i];
            if (item.name.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                filtered.push(item);
            }
        }
        this.productosFiltrados = filtered;
    }

}
