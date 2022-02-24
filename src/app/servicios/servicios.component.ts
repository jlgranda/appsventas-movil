import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { MessageService } from 'primeng/api';
import { User, UserService } from '../core';
import { Product } from '../modelo/Product';

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
        private menu: MenuController
    ) { }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            this.cargarDatosRelacionados();
        });
    }

    async cargarDatosRelacionados() {

        //Productos
        let producto = new Product();
        producto.id = 1;
        producto.name = 'Hora desarrollo Java';
        producto.price = 2.00;
        producto.image = 'gaming-set.jpg'
        producto.category = 'Tecnología';
        this.productos.push(producto);

        producto = new Product();
        producto.id = 2;
        producto.name = 'Hora soporte de contenidos';
        producto.price = 3.0;
        producto.image = 'gold-phone-case.jpg'
        producto.category = 'Contenidos';
        this.productos.push(producto);
        
        this.productosFiltrados = this.productos;
        
        this.groupItems(this.productosFiltrados);
    }
    
    groupItems(items) {
        this.groupedItems = [];
        let sortedItems = items.sort();
        let currentLetter = false;
        let currentItems = [];
        sortedItems.forEach((value, index) => {
            if (value.name.charAt(0) != currentLetter) {
                currentLetter = value.name.charAt(0);
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
    
    onFilterItems(event) {
        this.productosFiltrados = [];
        if (event.target.value && event.target.value.length > 1) {
            let query = event.target.value;
            this.productosFiltrados = this.productos.filter(val =>
                val.name.toLowerCase().includes(query.toLowerCase())
            );
            if (this.productosFiltrados) {
                this.groupItems(this.productosFiltrados);
            }
        } else {
            this.productosFiltrados = this.productos;
            this.groupItems(this.productosFiltrados);
        }
    }
    
    salir(event) {
        this.userService.purgeAuth();
    }

}
