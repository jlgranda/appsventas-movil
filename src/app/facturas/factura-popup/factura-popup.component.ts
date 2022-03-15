import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonRadioGroup, ModalController } from '@ionic/angular';
import { ContactosComponent } from 'src/app/contactos/contactos.component';
import { UIService, User, UserService } from 'src/app/core';
import { Invoice } from 'src/app/modelo/Invoice';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ServiciosComponent } from 'src/app/servicios/servicios.component';
import { ServiciosPopupComponent } from '../servicios-popup/servicios-popup.component';
import { ContactosPopupComponent } from '../contactos-popup/contactos-popup.component';
import { MessageService } from 'primeng/api';
import { ComprobantesService } from 'src/app/services/comprobantes.service';

@Component({
    selector: 'app-factura-popup',
    templateUrl: './factura-popup.component.html',
    styleUrls: ['./factura-popup.component.scss']
})
export class FacturaPopupComponent implements OnInit {

    @Input() factura: Invoice;
    currentUser: User;

    //DATA
    subjectCustomer: SubjectCustomer;
    product: Product;

    //UX
    aplicarIva12: boolean = true;
    IVA12: number = 0.12;
    IVA0: number = 0.00;
    listLocal: any[] = [];

    constructor(
        public userService: UserService,
        private uiService: UIService,
        private comprobantesService: ComprobantesService,
        private modalController: ModalController,
        private messageService: MessageService,
        private alertController: AlertController,
    ) { }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            let localVal = "";
            let item: any;
            if (this.currentUser.organization && this.currentUser.organization.numeroLocales) {
                for (let i = 1; i <= this.currentUser.organization.numeroLocales; i++) {
                    localVal = '00' + i;
                    item = { name: localVal, value: localVal };
                    this.listLocal.push(item);
                }
            } else {
                localVal = '001';
                item = { name: localVal, value: localVal };
                this.listLocal.push(item);
            }
            this.factura.estab = this.listLocal[0].value;
        });

        if (this.factura) {
            if (this.factura.subjectCustomer) {
                this.subjectCustomer = this.factura.subjectCustomer;
            }
            if (this.factura.product) {
                this.product = this.factura.product;
                this.calcularTotal(this.product.price);
            }
        }
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    confirmarFacturar(event) {
        //Ventana de confirmación
        this.presentAlertConfirm();
    }

    async presentAlertConfirm() {
        const alert = await this.alertController.create({
            cssClass: 'my-alert-class',
            header: 'Confirmación!',
            message: '¿Está seguro de realizar esta acción?',
            buttons: [
                {
                    text: 'NO',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                    }
                }, {
                    text: 'SI',
                    handler: () => {
                        this.addFactura(null);
                    }
                }
            ]
        });

        await alert.present();
    }

    async addFactura(event) {
        //Asignar selecciones del usuario
        this.factura.emissionOn = new Date();
        this.factura.product = this.product;
        this.factura.subjectCustomer = this.subjectCustomer;
        this.factura.iva12 = this.aplicarIva12;

        if (this.factura && this.factura.subjectCustomer && this.factura.product) {
            //Guardar la factura en persistencia para luego recargar las facturas
            this.comprobantesService.enviarFactura(this.factura).subscribe(
                async (data) => {
                    this.uiService.presentToastSeverity("success", "Se registró la factura con éxito.");
                    //Enviar la información de la factura y lo correspondiente
                    await this.modalController.dismiss(data);
                },
                (err) => {
                    this.uiService.presentToastSeverityHeader("error",
                        err["type"] ? err["type"] : 'ERROR INTERNO DE SERVIDOR',
                        err["message"] ? err["message"] : 'Por favor revise los datos e inténte nuevamente.');
                }
            );
        }

    }

    /**
    * Ir a seleccionar Contacto
    */
    async irAPopupContactos(event) {
        const modal = await this.modalController.create({
            component: ContactosPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-class',
            componentProps: {
                'subjectCustomer': this.subjectCustomer,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.subjectCustomer = modalDataResponse.data;
                this.uiService.presentToastSeverity("warning", `Facturar a ${this.subjectCustomer.customerFullName}`);
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
            cssClass: 'my-modal-class',
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
                this.uiService.presentToastSeverity("warning", `Facturar por concepto de ${this.product.name}`);
            }
        });

        return await modal.present();
    }

    /**
    ** Utilitarios
    */
    registrarSubtotal(event: any) {
        this.factura.subTotal = Number(event.target.value);
        this.recalcularSubtotal(null);
    }

    recalcularSubtotal(event: any) {
        if (this.factura.subTotal && this.factura.subTotal > 0) {
            this.calcularTotal(this.factura.subTotal);
        } else if (this.factura.importeTotal > 0) {
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
            this.uiService.presentToastSeverity("warning", "Monto a facturar no válido.");
        }
    }

    onSelectOption(event) {
        let value = event.target.value;
        if (value) {
            this.factura.estab = value;
        }
    }

    radioGroupChange(event) {
        if (event) {
            this.factura.estab = event.detail.value;
        }
    }

}
