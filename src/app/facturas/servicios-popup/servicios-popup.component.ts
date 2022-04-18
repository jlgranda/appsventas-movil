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

    //@Input() product: Product;
    @Input() details: InvoiceDetail[];

    products: Product[] = [];
    productsFiltered: Product[] = [];
    groupedItems = [];
    IVA12: number = 0.12;
    IVA0: number = 0.00;

    //Auxiliares
    keyword: string;

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
        this.uiService.presentLoading(500);

        //this.products = await this.getProductosPorTipoYOrganizacionDeUsuarioConectado('SERVICE');
        this.products = await this.getProductosPorOrganizacionDeUsuarioConectado();
        this.productsFiltered = this.products;
        //        this.cargarItemsFiltrados(this.products);
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

    async addProduct(event, p: Product) {
        //Enviar la información del producto seleccionado
        //        this.product = p;
        //        this.product.cantidad = this.cantidad;
        //        await this.modalController.dismiss(this.product);
    }

    async finishDetails(event) {
        await this.modalController.dismiss(this.details);
    }

    async irAPopupQuantity(event, p: Product) {
        const modal = await this.modalController.create({
            component: ServicioQuantityPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-popup-class',
            componentProps: {
                'product': p,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
//                this.addDetails(this.buildDetail(modalDataResponse.data));
                let detail: InvoiceDetail = new InvoiceDetail();
                detail.product = modalDataResponse.data;
                detail.amount = detail.product.quantity;
                if (detail.amount != 0){
                    this.addDetails(detail);
                } else {
                    this.removeDetails(detail);
                }
            }
        });

        return await modal.present();
    }

    private buildDetail(product: Product) {
        let newDetail: InvoiceDetail = new InvoiceDetail();
        newDetail.product = product;
        newDetail.quantity = product.quantity;
        newDetail.aplicarIva12 = product.taxType == 'IVA' ? true: false;
        newDetail.subtotal = precisionRound(newDetail.quantity * newDetail.product.price, 2);
        newDetail.iva0Total = precisionRound(this.IVA0 * newDetail.subtotal, 2);
        newDetail.iva12Total = newDetail.aplicarIva12 ? precisionRound(this.IVA12 * newDetail.subtotal, 2) : 0.00;
        newDetail.importeTotal = precisionRound((newDetail.subtotal + newDetail.iva0Total + newDetail.iva12Total),2);
        return newDetail;
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

    public detailsContains(item: Product): boolean {
        if (this.details && this.details.length && this.details.find(itm => itm.product.id == item.id)) {
            return true;
        }
        return false;
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
            }
        });

        return await modal.present();
    }

    /**
    ** Utilitarios
    */

    updateCantidad(event) {
    }

    async onFilterItems(event) {
        let query = event.target.value;
        this.productsFiltered = [];
        if (query && query.length > 2 && query.length < 6) {
            this.productsFiltered = this.buscarItemsFiltrados(this.products, query.trim());
            //            this.groupItems(this.productsFiltered);
        } else {
            if (!query) {
                this.productsFiltered = this.products;
                //                this.cargarItemsFiltrados(this.products);
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
        return filters;
    }

    cargarItemsFiltrados(items) {
        this.productsFiltered = items;
        this.groupItems(this.productsFiltered);
    }

    groupItems(items) {
        this.groupedItems = [];
        if (items && items.length) {
            let sortedItems = items.sort((a, b) =>
                (a.name && b.name &&
                    a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1);
            let currentLetter = false;
            let currentItems = [];
            sortedItems.forEach((value, index) => {
                let caracter = value.name.charAt(0).toLowerCase();
                if (caracter != currentLetter) {
                    currentLetter = caracter;
                    let newGroup = {
                        letter: currentLetter,
                        items: []
                    };
                    currentItems = newGroup.items;
                    this.groupedItems.push(newGroup);
                }
                currentItems.push(value);
            });
        }
    }

}
