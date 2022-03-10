import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, LoadingController, MenuController, ModalController } from '@ionic/angular';
import { MessageService } from 'primeng/api';
import { AppComponent } from '../app.component';
import { UIService, User, UserService } from '../core';
import { FacturaServicioComponent } from '../facturas/factura-servicio/factura-servicio.component';
import { Invoice } from '../modelo/Invoice';
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

    app: AppComponent;
    facturaServicio: FacturaServicioComponent;

    constructor(
        private router: Router,
        public userService: UserService,
        private messageService: MessageService,
        private menu: MenuController,
        private serviciosService: ServiciosService,
        private modalController: ModalController,
        private uiService: UIService,
        private appController: AppComponent,
        private facturaServicioController: FacturaServicioComponent,
        private actionSheetController: ActionSheetController,
    ) {
        this.app = appController;
        this.facturaServicio = facturaServicioController;
    }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            if (this.currentUser && this.currentUser.uuid) {
                this.cargarDatosRelacionados();
            }
        });
    }

    async cargarDatosRelacionados() {
        this.uiService.presentLoading(500);

        this.products = await this.getProductosPorTipoYOrganizacionDeUsuarioConectado('SERVICE');
        this.cargarItemsFiltrados(this.products);
    }

    async getProductosPorOrganizacionDeUsuarioConectado(): Promise<any> {
        return this.serviciosService.getProductosPorOrganizacionDeUsuarioConectado().toPromise();
    }

    async getProductosPorTipoYOrganizacionDeUsuarioConectado(productType: any): Promise<any> {
        return this.serviciosService.getProductosPorTipoYOrganizacionDeUsuarioConectado(productType).toPromise();
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
                        this.products = await this.getProductosPorTipoYOrganizacionDeUsuarioConectado('SERVICE');
                        this.cargarItemsFiltrados(this.products);
                        this.messageService.add({ severity: 'success', summary: "¡Bien!", detail: `Se registró el producto con éxito.` });
                    },
                    (err) => {
                        this.uiService.presentToastSeverity("error", err);
                    }
                );
            }
        });

        return await modal.present();
    }

    async presentarOpcionesActionSheet(event, p: Product) {
        const actionSheet = await this.actionSheetController.create({
            header: 'OPCIONES',
            cssClass: 'my-actionsheet-class',
            buttons: [
                {
                    text: 'Facturar',
                    role: 'destructive',
                    icon: 'paper-plane',
                    cssClass: 'primary',
                    handler: () => {
                        console.log('Facturar servicio');
                        //Popup para facturar con servicio
                        let f: Invoice = new Invoice();
                        f.product = p;
                        this.facturaServicio.irAPopupFactura(event, f);
                    }
                }, {
                    text: 'Editar',
                    icon: 'create',
                    handler: () => {
                        console.log('Editar servicio');
                        //Popup para editar contacto
                        this.irAPopupServicio(event, p);
                    }
                }, {
                    text: 'Cancelar',
                    icon: 'close',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancelar');
                    }
                }]
        });
        await actionSheet.present();

        const { role, data } = await actionSheet.onDidDismiss();
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
