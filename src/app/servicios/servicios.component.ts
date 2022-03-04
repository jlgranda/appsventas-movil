import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { MessageService } from 'primeng/api';
import { User, UserService } from '../core';
import { Product } from '../modelo/Product';
import { ServicioPopupComponent } from './servicio-popup/servicio-popup.component';
import { ServiciosService } from './servicios.service';

@Component({
    selector: 'app-servicios',
    templateUrl: './servicios.component.html',
    styleUrls: ['./servicios.component.scss']
})
export class ServiciosComponent implements OnInit {

    //Autenticación
    isAuthenticated: boolean;
    tags: Array<string> = [];
    tagsLoaded = false;
    currentUser: User;

    //Data
    products: Product[] = [];
    productsFiltered: Product[] = [];
    groupedItems = [];

    //Auxiliares
    keyword: string;

    constructor(
        private router: Router,
        public userService: UserService,
        private messageService: MessageService,
        private menu: MenuController,
        private serviciosService: ServiciosService,
        private modalController: ModalController
    ) { }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            this.cargarDatosRelacionados();
        });
    }

    async cargarDatosRelacionados() {
        this.products = await this.getProductosPorTipoYOrganizacionDeUsuarioConectado('SERVICE');
        this.cargarItemsFiltrados(this.products);
    }

    async getProductosPorOrganizacionDeUsuarioConectado(): Promise<any> {
        return this.serviciosService.getProductosPorOrganizacionDeUsuarioConectado().toPromise();
    }

    async getProductosPorTipoYOrganizacionDeUsuarioConectado(productType: any): Promise<any> {
        return this.serviciosService.getProductosPorTipoYOrganizacionDeUsuarioConectado(productType).toPromise();
    }

    /**
    ** Utilitarios
    */
    async onFilterItems(event) {
        let query = event.target.value;
        this.productsFiltered = [];
        if (query && query.length > 2) {
            this.productsFiltered = this.buscarItemsFiltrados(this.products, query);
            this.groupItems(this.productsFiltered);
        } else {
            this.cargarItemsFiltrados(this.products);
        }
    }

    buscarItemsFiltrados(items, query): any[] {
        let filters = [];
        if (items && items.length) {
            filters = items.filter(val =>
                val.name.toLowerCase().includes(query.toLowerCase())
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
                (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1);
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

    async irAServicioPopup(event, p: Product) {
        let productNuevo = new Product();
        if (p) {
            productNuevo = p;
        }
        const modal = await this.modalController.create({
            component: ServicioPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-custom-class',
            componentProps: {
                'product': productNuevo,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse != null) {
                if (modalDataResponse.data) {
                console.log('modalDataResponseFactura:::', modalDataResponse.data);
                    //Guardar producto en persistencia
                    this.serviciosService.enviarProducto(modalDataResponse.data).subscribe(
                        async (data) => {
                            this.products = [];
                            this.productsFiltered = [];
                            this.groupedItems = [];
                            console.log("data:::",data);
                            this.products = await this.getProductosPorTipoYOrganizacionDeUsuarioConectado('SERVICE');
                            this.cargarItemsFiltrados(this.products);
                            this.messageService.add({ severity: 'success', summary: "¡Bien!", detail: `Se añadió el producto con éxito.` });
                        },
                        (err) => {
                            this.messageService.add({ severity: 'error', summary: "Error", detail: err });
                        }
                    );
                }
            }
        });

        return await modal.present();
    }

    salir(event) {
        this.userService.purgeAuth();
    }

}
