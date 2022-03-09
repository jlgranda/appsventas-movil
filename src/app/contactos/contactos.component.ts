import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, LoadingController, MenuController, ModalController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { MessageService } from 'primeng/api';

import { User, UserService } from 'src/app/core';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ContactoPopupComponent } from './contacto-popup/contacto-popup.component';
import { ContactosService } from './contactos.service';
import { AppComponent } from 'src/app/app.component';
import { Invoice } from '../modelo/Invoice';
import { FacturaServicioComponent } from '../facturas/factura-servicio/factura-servicio.component';

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

    subjectCustomers: SubjectCustomer[] = [];
    subjectCustomersFiltered: SubjectCustomer[] = [];
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
        private contactosService: ContactosService,
        private modalController: ModalController,
        private appController: AppComponent,
        public facturaServicioController: FacturaServicioComponent,
        public navCtrl: NavController,
        public loadingController: LoadingController,
        public actionSheetController: ActionSheetController,
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
        const loading = await this.loadingController.create({
            cssClass: 'my-loading-class',
            message: 'Por favor espere...',
        });
        await loading.present();

        this.subjectCustomers = await this.getContactosPorUsuarioConectado();
        this.cargarItemsFiltrados(this.subjectCustomers);

        setTimeout(() => {
            loading.dismiss();
        });
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
            if (modalDataResponse && modalDataResponse.data) {
                //Guardar contacto en persistencia
                this.contactosService.enviarContacto(modalDataResponse.data).subscribe(
                    async (data) => {
                        this.subjectCustomers = await this.getContactosPorUsuarioConectado();
                        this.cargarItemsFiltrados(this.subjectCustomers);
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

    async presentarOpcionesActionSheet(event, sc: SubjectCustomer) {
        const actionSheet = await this.actionSheetController.create({
            header: 'OPCIONES',
            cssClass: 'my-actionsheet-class',
            buttons: [
                {
                    text: 'Editar',
                    role: 'destructive',
                    icon: 'create',
                    handler: () => {
                        console.log('Editar contacto');
                        //Popup para editar contacto
                        this.irAPopupContacto(event, sc);
                    }
                }, {
                    text: 'Facturar',
                    icon: 'paper-plane',
                    handler: () => {
                        console.log('Facturar contacto');
                        //Popup para facturar con contacto
                        let f: Invoice = new Invoice();
                        f.subjectCustomer = sc;
                        this.facturaServicio.irAPopupFactura(event, f);
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
//        console.log('onDidDismiss resolved with role and data', role, data);
    }

    /**
    ** Utilitarios
    */
    async onFilterItems(event) {
        let query = event.target.value;
        this.subjectCustomersFiltered = [];
        if (query && query.length > 2 && query.length < 6) {
            this.subjectCustomersFiltered = this.buscarItemsFiltrados(this.subjectCustomers, query.trim());
            if (!this.subjectCustomersFiltered || (this.subjectCustomersFiltered && !this.subjectCustomersFiltered.length)) {
                this.cargarItemsFiltrados(await this.getContactosPorKeyword(query.trim()));
            } else {
                this.groupItems(this.subjectCustomersFiltered);
            }
        } else {
            if (!query) {
                this.cargarItemsFiltrados(this.subjectCustomers);
            }
        }
    }

    buscarItemsFiltrados(items, query): any[] {
        let filters = [];
        if (items && items.length) {
            filters = items.filter(val =>
                (val.customerFullName && val.customerFullName.toLowerCase().includes(query.toLowerCase()))
                || (val.customerInitials && val.customerInitials.toLowerCase().includes(query.toLowerCase()))
                || (val.customerCode && val.customerCode.toLowerCase().includes(query.toLowerCase()))
                || (val.customerEmail && val.customerEmail.toLowerCase().includes(query.toLowerCase()))
            );
        }
        return filters;
    }

    cargarItemsFiltrados(items) {
        this.subjectCustomersFiltered = items;
        this.groupItems(this.subjectCustomersFiltered);
    }

    groupItems(items) {
        this.groupedItems = [];
        if (items && items.length) {
            let sortedItems = items.sort((a, b) =>
                (a.customerFullName && b.customerFullName &&
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
}