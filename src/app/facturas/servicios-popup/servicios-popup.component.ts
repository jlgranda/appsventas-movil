import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { MessageService } from 'primeng/api';
import { UIService } from 'src/app/core';
import { InvoiceDetail } from 'src/app/modelo/InvoiceDetail';
import { Product } from 'src/app/modelo/Product';
import { ServicioPopupComponent } from 'src/app/servicios/servicio-popup/servicio-popup.component';
import { ServicioQuantityPopupComponent } from 'src/app/servicios/servicio-quantity-popup/servicio-quantity-popup.component';
import { ServiciosService } from 'src/app/servicios/servicios.service';
import { precisionRound } from 'src/app/shared/helpers';

@Component({
    selector: 'app-servicios-popup',
    templateUrl: './servicios-popup.component.html',
    styleUrls: ['./servicios-popup.component.scss']
})
export class ServiciosPopupComponent implements OnInit {

    @Input() details: InvoiceDetail[];

    products: Product[] = [];
    productsFiltered: Product[] = [];
    groupedItems = [];
    IVA12: number = 0.12;
    IVA0: number = 0.00;

    //Auxiliares
    keyword: string;

    process: boolean = false;

    constructor(
        private uiService: UIService,
        private modalController: ModalController,
        private modalControllerDetail: ModalController,
        private serviciosService: ServiciosService,
        private messageService: MessageService,
        private navCtrl: NavController,
    ) { }

    ngOnInit() {
        this.cargarDatosRelacionados();
    }

    doRefresh(event) {
        this.cargarDatosRelacionados();
        setTimeout(() => {
            event.target.complete();
        }, 2000);
    }

    async cargarDatosRelacionados() {
        this.process = true;
        this.products = [];

        //this.products = await this.getProductosPorTipoYOrganizacionDeUsuarioConectado('SERVICE');
        this.products = this.asignedQuantities(await this.getProductosPorOrganizacionDeUsuarioConectado());
        this.productsFiltered = this.products;
        this.process = false;
    }

    asignedQuantities(products: Product[]) {
        if (this.details.length) {
            this.details.forEach((val) => {
                if (products.find(item => item.id == val.product.id)) {
                    products[products.indexOf(products.find(item => item.id == val.product.id))]['quantity'] = val.product.quantity;
                }
            });
        }
        return products;
    }

    async getProductosPorOrganizacionDeUsuarioConectado(): Promise<any> {
        return this.serviciosService.getProductosPorOrganizacionDeUsuarioConectado().toPromise();
    }
    async getProductosPorTipoYOrganizacionDeUsuarioConectado(productType: any): Promise<any> {
        return this.serviciosService.getProductosPorTipoYOrganizacionDeUsuarioConectado(productType).toPromise();
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async finishDetails(event) {
        await this.modalController.dismiss(this.details);
    }

    async irAPopupQuantity(event, p: Product) {
        const modal = await this.modalController.create({
            component: ServicioQuantityPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-popup-one-class',
            componentProps: {
                'product': p,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                let detail: InvoiceDetail = new InvoiceDetail();
                detail.product = modalDataResponse.data;
                detail.amount = detail.product.quantity;
                if (detail.amount != 0) {
                    this.addDetails(detail);
                } else {
                    this.removeDetails(detail);
                }
            }
        });

        return await modal.present();
    }

    async irAPopupServicio(event, p: Product) {
        if (!p) {
            p = new Product();
        }
        const modal = await this.modalController.create({
            component: ServicioPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-class',
            componentProps: {
                'product': p,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.cargarDatosRelacionados();
                let detail: InvoiceDetail = new InvoiceDetail();
                detail.product = modalDataResponse.data;
                detail.amount = detail.product.quantity;
                if (detail.amount != 0) {
                    this.addDetails(detail);
                } else {
                    this.removeDetails(detail);
                }
            }
        });

        return await modal.present();
    }

    /**
    ** Utilitarios
    */
    async onFilterItems(event) {
        this.process = true;
        let query = event.target.value;
        this.productsFiltered = [];
        if (query && query.length > 3 && query.length < 6) {
            this.productsFiltered = this.buscarItemsFiltrados(this.products, query.trim());
        } else {
            if (!query) {
                this.productsFiltered = this.products;
                this.process = false;
            }
        }
    }

    buscarItemsFiltrados(items, query): any[] {
        let filters = [];
        if (items && items.length) {
            filters = items.filter(val =>
                (val.name && val.name.toLowerCase().includes(query.toLowerCase()))
            );
        }
        this.process = false;
        return filters;
    }

    public detailsContains(item: Product): boolean {
        if (this.details && this.details.length && this.details.find(itm => itm.product.id == item.id)) {
            return true;
        }
        return false;
    }

    private addDetails(newDetail: InvoiceDetail) {
        if (this.details && this.details.length) {
            let d = this.details.find(item => item.product.id == newDetail.product.id);
            if (d) {
                this.details[this.details.indexOf(d)] = newDetail;
            } else {
                this.details.unshift(newDetail);
            }
        } else {
            this.details.unshift(newDetail);
        }
    }
    private removeDetails(newDetail: InvoiceDetail) {
        if (this.details && this.details.length) {
            const indexOfObject = this.details.indexOf(newDetail);
            this.details.splice(indexOfObject, 1);
        } else {
            this.details = [];
        }
    }

}
