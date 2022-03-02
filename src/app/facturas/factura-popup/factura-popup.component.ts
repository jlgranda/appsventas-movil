import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ContactosComponent } from 'src/app/contactos/contactos.component';
import { UIService } from 'src/app/core';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ServiciosComponent } from 'src/app/servicios/servicios.component';

@Component({
    selector: 'app-factura-popup',
    templateUrl: './factura-popup.component.html',
    styleUrls: ['./factura-popup.component.scss']
})
export class FacturaPopupComponent implements OnInit {

    @Input() factura: Invoice;
    @Input() cliente: SubjectCustomer;
    @Input() producto: Product;

    facturaDetalle: InvoiceDetail = new InvoiceDetail();
    clientes: SubjectCustomer[] = [];
    clientesFiltrados: SubjectCustomer[] = [];
    //cliente: SubjectCustomer = new SubjectCustomer();
    productos: Product[] = [];
    productosFiltrados: Product[] = [];
    
    aplicarIva12:boolean = true;
    
    IVA12:number = 0.12;
    IVA0:number = 0.0;
    
    subTotal:number = 0;

    constructor(
        private uiService: UIService,
        private modalController: ModalController,
    ) { }

    ngOnInit(): void {
//        //Clientes
        this.cliente = new SubjectCustomer();
        this.cliente.customerFullName = 'APEOSAE';
        this.cliente.customerCode = '1990905165001';
//        this.clientes.push(cliente);
//
//        cliente = new SubjectCustomer();
//        cliente.customerFullName = 'José Luis Granda';
//        cliente.customerCode = '1103826960';
//        this.clientes.push(cliente);
//
//        cliente = new SubjectCustomer();
//        cliente.customerFullName = 'Juan Perez';
//        cliente.customerCode = '1150659845';
//        this.clientes.push(cliente);

        //Productos
//        let producto = new Product();
//        producto.id = 1;
//        producto.name = 'Hora desarrollo Java';
//        producto.price = 2.00;
//        producto.photo = 'gaming-set.jpg'
//        producto.categoryName = 'Tecnología';
//        this.productos.push(producto);
//
//        producto = new Product();
//        producto.id = 2;
//        producto.name = 'Hora soporte de contenidos';
//        producto.price = 3.0;
//        producto.photo = 'gold-phone-case.jpg'
//        producto.categoryName = 'Contenidos';
//        this.productos.push(producto);

        this.producto = new Product();
        this.producto.id = 1;
        this.producto.name = 'Servicio de hosting y dominio profesional';
        this.producto.price = 250;
        this.producto.photo = 'gaming-set.jpg'
        this.producto.categoryName = 'Tecnología';

    }

    async close(event) {
        await this.modalController.dismiss(null);
    }

    async agregarFactura(form: any) {
        
        //Asignar selecciones del usuario
        this.factura.customer = this.cliente;
        this.factura.product = this.producto;
        
        if (this.factura && this.factura.customer && this.factura.product) {
            this.factura.customerFullName = this.factura.customer.customerFullName;
            this.factura.fechaEmision = new Date();
        }
        await this.modalController.dismiss(this.factura);
    }
    
    calcularTotal(evt:any){
        console.log(this.subTotal);
        if ( this.factura.subTotal && this.subTotal > 0 ){
            if (this.aplicarIva12){
                this.factura.importeTotal =  this.subTotal + (this.IVA12 * this.factura.subTotal);
            } else {
                this.factura.importeTotal =  this.subTotal + (this.IVA0 * this.factura.subTotal);
            }
        } else {
            this.uiService.presentToast("Monto a facturar no válido.");
        }
        
        console.log(this.factura);
        console.log(this.factura.importeTotal);
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
    
    dismissModal(){
        this.modalController.dismiss({
            'dismissed': true
          });
    }
    
    async irASeleccionarProducto(){
        const modal = await this.modalController.create({
            component: ServiciosComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            componentProps: {
                'producto': null,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse !== null) {
                this.producto = modalDataResponse.data;
                console.log('modalReceptData > Product:::', this.producto);
            }
        });

        return await modal.present();
    }
    
    /**
    * Ir a seleccionar Contacto
    */
    async irASeleccionarCliente(){
        const modal = await this.modalController.create({
            component: ContactosComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            componentProps: {
                'contacto': null,
                'selectable': true,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse !== null) {
                this.producto = modalDataResponse.data;
                console.log('modalReceptData > Product:::', this.producto);
            }
        });

        return await modal.present();
    }

}
