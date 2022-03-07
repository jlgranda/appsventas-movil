import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { MessageService } from 'primeng/api';

import { User, UserService } from 'src/app/core';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ContactoPopupComponent } from './contacto-popup/contacto-popup.component';
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

    //Popup Data
    @Input() cliente: SubjectCustomer = new SubjectCustomer();
    @Input() selectable: boolean;

    customers: SubjectCustomer[] = [];
    customersFiltered: SubjectCustomer[] = [];
    groupedItems = [];

    //Auxiliares
    keyword: string;

    constructor(
        private router: Router,
        public userService: UserService,
        private messageService: MessageService,
        private menu: MenuController,
        private contactosService: ContactosService,
        private modalController: ModalController
    ) { }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            this.cargarDatosRelacionados();
        });
    }

    async cargarDatosRelacionados() {
        this.customers = await this.getContactosPorUsuarioConectado();
        this.cargarItemsFiltrados(this.customers);
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

    async irAPopupContacto(event, sc: SubjectCustomer) {
        if (!sc) {
            sc = new SubjectCustomer();
        }
        const modal = await this.modalController.create({
            component: ContactoPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-custom-class',
            componentProps: {
                'subjectCustomer': sc,
            }
        });

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse != null) {
                //Guardar contacto en persistencia
                this.contactosService.enviarContacto(modalDataResponse.data).subscribe(
                    async (data) => {
                        this.customers = await this.getContactosPorUsuarioConectado();
                        this.cargarItemsFiltrados(this.customers);
                        this.messageService.add({ severity: 'success', summary: "¡Bien!", detail: `Se añadió el contacto con éxito.` });
                    },
                    (err) => {
                        this.messageService.add({ severity: 'error', summary: "Error", detail: err });
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
        this.customersFiltered = [];
        if (query && query.length > 2 && query.length < 6) {
            this.customersFiltered = this.buscarItemsFiltrados(this.customers, query.trim());
            if (!this.customersFiltered || (this.customersFiltered && !this.customersFiltered.length)) {
                this.cargarItemsFiltrados(await this.getContactosPorKeyword(query.trim()));
            } else {
                this.groupItems(this.customersFiltered);
            }
        } else {
            this.cargarItemsFiltrados(this.customers);
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
        this.customersFiltered = items;
        this.groupItems(this.customersFiltered);
    }

    groupItems(items) {
        this.groupedItems = [];
        if (items && items.length) {
            let sortedItems = items.sort((a, b) =>
                (a.customerFullName != null && b.customerFullName != null &&
                    a.customerFullName.toLowerCase() < b.customerFullName.toLowerCase()) ? -1 : 1);
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