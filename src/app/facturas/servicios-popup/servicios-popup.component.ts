import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UIService } from 'src/app/core';
import { Product } from 'src/app/modelo/Product';
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
        private serviciosService: ServiciosService
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

    async cancel(event) {
        await this.modalController.dismiss(null);
    };

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
                (a.name != null && b.name != null &&
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

    async buttonClick(event, item) {
        //Enviar la información del producto seleccionado
        await this.modalController.dismiss(item);
    }

}
