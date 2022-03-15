import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MessageService } from 'primeng/api';
import { UIService } from 'src/app/core';
import { Product } from 'src/app/modelo/Product';
import { ServicioPopupComponent } from 'src/app/servicios/servicio-popup/servicio-popup.component';
import { ServiciosService } from 'src/app/servicios/servicios.service';

@Component({
    selector: 'app-servicios-popup',
    templateUrl: './servicios-popup.component.html',
    styleUrls: ['./servicios-popup.component.scss']
})
export class ServiciosPopupComponent implements OnInit {

    @Input() product: Product;

    products: Product[] = [];
    productsFiltered: Product[] = [];
    groupedItems = [];

    //Auxiliares
    keyword: string;

    constructor(
        private uiService: UIService,
        private modalController: ModalController,
        private serviciosService: ServiciosService,
        private messageService: MessageService,
    ) { }

    ngOnInit() {
        this.cargarDatosRelacionados();
    }

    async cargarDatosRelacionados() {
        this.products = await this.getProductosPorTipoYOrganizacionDeUsuarioConectado('SERVICE');
        this.cargarItemsFiltrados(this.products);
    }

    async getProductosPorTipoYOrganizacionDeUsuarioConectado(productType: any): Promise<any> {
        return this.serviciosService.getProductosPorTipoYOrganizacionDeUsuarioConectado(productType).toPromise();
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async addProduct(event, p: Product) {
        //Enviar la información del producto seleccionado
        this.product = p;
        await this.modalController.dismiss(this.product);
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
                //Guardar producto en persistencia
                this.serviciosService.enviarProducto(modalDataResponse.data).subscribe(
                    async (data) => {
                        await this.modalController.dismiss(data);
                    },
                    (err) => {
                        this.uiService.presentToastSeverityHeader("error",
                            err["type"] ? err["type"] : 'ERROR INTERNO DE SERVIDOR',
                            err["message"] ? err["message"] : 'Por favor revise los datos e inténte nuevamente.');
                    }
                );
            }
        });

        return await modal.present();
    }

    /**
    ** Utilitarios
    */
    async onFilterItems(event) {
        let query = event.target.value;
        this.productsFiltered = [];
        if (query && query.length > 2 && query.length < 6) {
            this.productsFiltered = this.buscarItemsFiltrados(this.products, query.trim());
            this.groupItems(this.productsFiltered);
        } else {
            if (!query) {
                this.cargarItemsFiltrados(this.products);
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
