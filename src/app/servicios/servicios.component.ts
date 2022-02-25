import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { MessageService } from 'primeng/api';
import { User, UserService } from '../core';
import { Product } from '../modelo/Product';
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
    productos: Product[] = [];
    productosFiltrados: Product[] = [];
    producto: Product = new Product();
    groupedItems = [];

    //Auxiliares
    keyword: string;

    constructor(
        private router: Router,
        public userService: UserService,
        private messageService: MessageService,
        private menu: MenuController,
        private serviciosService: ServiciosService
    ) { }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            this.cargarDatosRelacionados();
        });
    }

    async cargarDatosRelacionados() {

        //        //Productos
        //        let producto = new Product();
        //        producto.id = 1;
        //        producto.name = 'Hora desarrollo Java';
        //        producto.price = 2.00;
        //        producto.image = 'gaming-set.jpg'
        //        producto.category = 'Tecnología';
        //        this.productos.push(producto);
        //
        //        producto = new Product();
        //        producto.id = 2;
        //        producto.name = 'Hora soporte de contenidos';
        //        producto.price = 3.0;
        //        producto.image = 'gold-phone-case.jpg'
        //        producto.category = 'Contenidos';
        //        this.productos.push(producto);
        //        
        this.productos = await this.getProductosPorTipoYOrganizacionDeUsuarioConectado('SERVICE');
        this.cargarItemsFiltrados(this.productos);
    }

    async getProductosPorOrganizacionDeUsuarioConectado(): Promise<any> {
        return this.serviciosService.getProductosPorOrganizacionDeUsuarioConectado().toPromise();
    }
    
    async getProductosPorTipoYOrganizacionDeUsuarioConectado(productType: any): Promise<any> {
        return this.serviciosService.getProductosPorTipoYOrganizacionDeUsuarioConectado(productType).toPromise();
    }
//    SERVICE
    /**
    ** Utilitarios
    */
    async onFilterItems(event) {
        let query = event.target.value;
        this.groupedItems = [];
        this.productosFiltrados = [];
        if (query && query.length > 2) {
            this.productosFiltrados = this.buscarItemsFiltrados(this.productos, query);
            this.groupItems(this.productosFiltrados);
        } else {
            this.cargarItemsFiltrados(this.productos);
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
        this.productosFiltrados = items;
        this.groupItems(this.productosFiltrados);
    }

    groupItems(items) {
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
        console.log("this.groupedItems:::",this.groupedItems);
    }

    salir(event) {
        this.userService.purgeAuth();
    }

}
