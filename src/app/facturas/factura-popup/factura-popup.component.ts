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
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-factura-popup',
    templateUrl: './factura-popup.component.html',
    styleUrls: ['./factura-popup.component.scss']
})
export class FacturaPopupComponent implements OnInit {

    @Input() factura: Invoice;

    //Data
    subjectCustomer: SubjectCustomer;
    product: Product;

    //Auxiliares
    aplicarIva12: boolean = true;
    IVA12: number = 0.12;
    IVA0: number = 0.00;

    constructor(
        private uiService: UIService,
        private modalController: ModalController,
        private messageService: MessageService,
    ) { }

    ngOnInit(): void {
        console.log("factura:::",this.factura);
        if(this.factura && this.factura.subjectCustomer){
        this.subjectCustomer = this.factura.subjectCustomer;
        }
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async addFactura(event) {
        //Asignar selecciones del usuario
        this.factura.emissionOn = new Date();
        this.factura.product = this.product;
        this.factura.subjectCustomer = this.subjectCustomer;
        this.factura.iva12 = this.aplicarIva12;
        //Enviar la información de la factura y lo correspondiente
        await this.modalController.dismiss(this.factura);
    }

    /**
    * Ir a seleccionar Contacto
    */
    async irAPopupContactos(event) {
        const modal = await this.modalController.create({
            component: ContactosPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-custom-class',
            componentProps: {
                'subjectCustomer': this.subjectCustomer,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.subjectCustomer = modalDataResponse.data;
                this.messageService.add({ severity: 'success', summary: "¡Bien!", detail: `Contacto seleccionado.` });
            }
        });

        return await modal.present();
    }

    /**
    * Ir a seleccionar Servicio
    */
    async irAPopupServicios(event) {
        const modal = await this.modalController.create({
            component: ServiciosPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-custom-class',
            componentProps: {
                'product': this.product,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.product = modalDataResponse.data;
                if (!this.factura.subTotal) {
                    this.calcularTotal(this.product.price);
                }
                this.messageService.add({ severity: 'success', summary: "¡Bien!", detail: `Servicio seleccionado.` });
            }
        });

        return await modal.present();
    }

    /**
    ** Utilitarios
    */
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
            this.uiService.presentToast("¡Advertencia! Monto a facturar no válido.");
        }
    }

}
