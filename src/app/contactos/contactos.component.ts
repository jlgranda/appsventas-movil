import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { MessageService } from 'primeng/api';

import { User, UserService } from 'src/app/core';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ContactosService } from './contactos.service';

@Component({
    selector: 'app-contactos',
    templateUrl: './contactos.component.html',
    styleUrls: ['./contactos.component.scss']
})
export class ContactosComponent implements OnInit {

    //Autenticación
    isAuthenticated: boolean;
    tags: Array<string> = [];
    tagsLoaded = false;
    currentUser: User;

    //Data
    clientes: SubjectCustomer[] = [];
    clientesFiltrados: SubjectCustomer[] = [];
    cliente: SubjectCustomer = new SubjectCustomer();
    groupedItems = [];

    //Auxiliares
    keyword: string;

    constructor(
        private router: Router,
        public userService: UserService,
        private messageService: MessageService,
        private menu: MenuController,
        private contactosService: ContactosService
    ) { }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            this.cargarDatosRelacionados();
        });
    }

    async cargarDatosRelacionados() {
        this.clientes = await this.getContactosPorUsuarioConectado();
        this.cargarItemsFiltrados(this.clientes);
    }

    async getContactosPorUsuarioConectado(): Promise<any> {
        return this.contactosService.getContactosPorUsuarioConectado().toPromise();
    }

    async getContactosPorUsuarioConectadoYKeyword(keyword: string): Promise<any> {
        return this.contactosService.getContactosPorUsuarioConectadoYKeyword(keyword).toPromise();
    }
    async getContactosPorKeyword(keyword: string): Promise<any> {
        return this.contactosService.getContactosPorKeyword(keyword).toPromise();
    }

    /**
    ** Utilitarios
    */
    async onFilterItems(event) {
        let query = event.target.value;
        this.groupedItems = [];
        this.clientesFiltrados = [];
        if (query && query.length > 2) {
            this.clientesFiltrados = this.buscarItemsFiltrados(this.clientes, query);
            if (!this.clientesFiltrados || (this.clientesFiltrados && !this.clientesFiltrados.length)) {
                this.cargarItemsFiltrados(await this.getContactosPorKeyword(query));
            } else {
                this.groupItems(this.clientesFiltrados);
            }
        } else {
            this.cargarItemsFiltrados(this.clientes);
        }
    }

    buscarItemsFiltrados(items, query): any[] {
        let filters = [];
        if (items && items.length) {
            filters = items.filter(val =>
                val.customerFullName.toLowerCase().includes(query.toLowerCase())
                || val.customerInitials.toLowerCase().includes(query.toLowerCase())
                || val.customerCode.toLowerCase().includes(query.toLowerCase())
                || val.customerEmail.toLowerCase().includes(query.toLowerCase())
            );
        }
        return filters;
    }

    cargarItemsFiltrados(items) {
        this.clientesFiltrados = items;
        this.groupItems(this.clientesFiltrados);
    }

    groupItems(items) {
        if (items && items.length) {
            let sortedItems = items.sort((a, b) =>
                (a.customerFullName.toLowerCase() < b.customerFullName.toLowerCase()) ? -1 : 1);
            let currentLetter = false;
            let currentItems = [];
            sortedItems.forEach((value, index) => {
                let caracter = value.customerFullName.charAt(0).toLowerCase();
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

    salir(event) {
        this.userService.purgeAuth();
    }

}