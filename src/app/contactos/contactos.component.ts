import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { MessageService } from 'primeng/api';

import { User, UserService } from 'src/app/core';
import { Subject } from 'src/app/modelo/Subject';

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
    clientes: Subject[] = [];
    clientesFiltrados: Subject[] = [];
    cliente: Subject = new Subject();
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

        //Clientes
        let cliente: Subject = new Subject();
        cliente.name = 'Kelly Paulina Narváez Castillo';
        cliente.code = '1150458519';
        cliente.email = 'kelly.narvaez1@gmail.com'
        this.clientes.push(cliente);

        cliente = new Subject();
        cliente.name = 'José Luis Granda';
        cliente.code = '1103826960';
        cliente.email = 'jlgranda81@gmail.com'
        this.clientes.push(cliente);

        cliente = new Subject();
        cliente.name = 'Juan Perez';
        cliente.code = '1150659845';
        cliente.email = 'jperez@gmail.com'
        this.clientes.push(cliente);
        
        this.clientesFiltrados = this.clientes;

        this.groupItems(this.clientesFiltrados);

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
        this.clientesFiltrados = [];
        if (event.target.value && event.target.value.length > 1) {
            let query = event.target.value;
            this.clientesFiltrados = this.clientes.filter(val =>
                val.name.toLowerCase().includes(query.toLowerCase()) 
                || val.code.toLowerCase().includes(query.toLowerCase()) 
                || val.email.toLowerCase().includes(query.toLowerCase())
            );
            if (this.clientesFiltrados) {
                this.groupItems(this.clientesFiltrados);
            }
        } else {
            this.clientesFiltrados = this.clientes;
            this.groupItems(this.clientesFiltrados);
        }
    }

    salir(event) {
        this.userService.purgeAuth();
    }

}
