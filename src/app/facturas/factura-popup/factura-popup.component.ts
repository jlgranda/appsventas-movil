import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ContactosComponent } from 'src/app/contactos/contactos.component';
import { UIService } from 'src/app/core';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ServiciosComponent } from 'src/app/servicios/servicios.component';
import { ServiciosPopupComponent } from '../servicios-popup/servicios-popup.component';
import { ContactosPopupComponent } from '../contactos-popup/contactos-popup.component';

@Component({
    selector: 'app-factura-popup',
    templateUrl: './factura-popup.component.html',
    styleUrls: ['./factura-popup.component.scss']
})
export class FacturaPopupComponent implements OnInit {

    @Input() factura: Invoice;

    //Data
    customer: SubjectCustomer;
    product: Product;

    //Auxiliares
    aplicarIva12: boolean = true;
    IVA12: number = 0.12;
    IVA0: number = 0.00;

    constructor(
        private uiService: UIService,
        private modalController: ModalController,
    ) { }

    ngOnInit(): void {
        this.customer = new SubjectCustomer();
        this.customer.customerFullName = 'APEOSAE';
        this.customer.customerCode = '1990905165001';
        this.product = new Product();
        this.product.id = 1;
        this.product.name = 'Servicio de hosting y dominio profesional';
        this.product.price = 250;
        this.product.photo = 'gaming-set.jpg'
        this.product.categoryName = 'Tecnología';
    }

    async cancel(event) {
        await this.modalController.dismiss(null);
    };

    registrarSubtotal(event: any) {
        let valorIva: number = 0;
        this.calcularTotal(Number(event.target.value));
    }

    recalcularSubtotal(event: any) {
        if (this.factura.subTotal) {
            this.calcularTotal(this.factura.subTotal);
        } else {
            this.calcularTotal(0);
        }
    }

    calcularTotal(amount: number) {
        this.factura.subTotal = amount;
        let valorIva: number = this.IVA0 * this.factura.subTotal;
        this.factura.iva0Total = valorIva;
        if (this.factura && this.factura.subTotal > 0) {
            if (this.aplicarIva12) {
                valorIva = this.IVA12 * this.factura.subTotal;
                this.factura.iva12Total = valorIva;
            }
            this.factura.importeTotal = this.factura.subTotal + valorIva;
        } else {
            this.factura.iva0Total = 0.00;
            this.factura.iva12Total = 0.00;
            this.factura.importeTotal = 0;
            this.uiService.presentToast("Monto a facturar no válido.");
        }
    }

    async irASeleccionarProducto(event) {
        const modal = await this.modalController.create({
            component: ServiciosPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-custom-class',
            componentProps: {
                'product': new Product(),
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse != null) {
                console.log('modalDataResponse:::', modalDataResponse.data);
                this.product = modalDataResponse.data;
            }
        });

        return await modal.present();
    }

    /**
    * Ir a seleccionar Contacto
    */
    async irASeleccionarCliente(event) {
        const modal = await this.modalController.create({
            component: ContactosPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-custom-class',
            componentProps: {
                'customer': new SubjectCustomer(),
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse != null) {
                console.log('modalDataResponse:::', modalDataResponse.data);
                this.customer = modalDataResponse.data;
            }
        });

        return await modal.present();
    }

    async agregarFactura(event) {
        //Asignar selecciones del usuario
        this.factura.subjectCustomer = this.customer;
        this.factura.product = this.product;
        this.factura.emissionOn = new Date();

        if (this.factura && this.factura.subjectCustomer && this.factura.product) {
            this.factura.customerFullName = this.factura.subjectCustomer.customerFullName;
        }
        //Enviar la información de la factura y lo correspondiente
        await this.modalController.dismiss(this.factura);
    }

}
