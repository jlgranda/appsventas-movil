import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, LoadingController, MenuController, ModalController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { MessageService } from 'primeng/api';

import { UIService, User, UserService } from 'src/app/core';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ContactoPopupComponent } from './contacto-popup/contacto-popup.component';
import { ContactosService } from './contactos.service';
import { AppComponent } from 'src/app/app.component';
import { Invoice } from '../modelo/Invoice';
import { FacturaServicioComponent } from '../facturas/factura-servicio/factura-servicio.component';
import { Subject } from '../modelo/Subject';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { validateDNIPattern } from 'src/app/shared/helpers';

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
    searching: boolean = false;

    app: AppComponent;
    facturaServicio: FacturaServicioComponent;

    public searchControl: FormControl;

    valido: boolean = false;

    constructor(
        private router: Router,
        public userService: UserService,
        private messageService: MessageService,
        private menu: MenuController,
        private contactosService: ContactosService,
        private modalController: ModalController,
        private appController: AppComponent,
        private facturaServicioController: FacturaServicioComponent,
        private uiService: UIService,
        private actionSheetController: ActionSheetController,
        private sanitizer: DomSanitizer,
        private navCtrl: NavController,
        private facturaController: FacturaServicioComponent,
    ) {
        this.app = appController;
        this.facturaServicio = facturaServicioController;

        this.searchControl = new FormControl();
    }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            if (this.currentUser) {
                if (this.currentUser.initials && this.currentUser.initials != 'RUC NO VALIDO') {
                    this.valido = true;
                    this.cargarDatosRelacionados();

                    this.searchControl.valueChanges
                        .pipe(debounceTime(700))
                        .subscribe(search => {
                            this.onFilterItems(null);
                        });
                }
            }
        });
    }

    doRefresh(event) {
        this.cargarDatosRelacionados();
        setTimeout(() => {
            event.target.complete();
        }, 2000);
    }

    async cargarDatosRelacionados() {
        this.uiService.presentLoading(1000);

        this.subjectCustomers = await this.getContactosPorUsuarioConectado();
        this.cargarItemsFiltrados(this.subjectCustomers);
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

    async getContacto(contactoId: number): Promise<any> {
        return this.contactosService.getContacto(contactoId).toPromise();
    }

    async irAPopupContacto(event, sc: SubjectCustomer) {
        if (!sc) {
            sc = new SubjectCustomer();
        }
        const modal = await this.modalController.create({
            component: ContactoPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-class',
            componentProps: {
                'subjectCustomer': sc,
            }
        });

        modal.onDidDismiss().then(async (modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.subjectCustomers = await this.getContactosPorUsuarioConectado();
                this.cargarItemsFiltrados(this.subjectCustomers);
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
                    text: 'Facturar',
                    role: 'destructive',
                    icon: 'paper-plane',
                    cssClass: 'primary',
                    handler: () => {
                        console.log('Facturar contacto');
                        //Popup para facturar con contacto
                        let f: Invoice = new Invoice();
                        f.subjectCustomer = sc;
                        this.facturaServicio.irAPopupFactura(event, f);
                    }
                }, {
                    text: 'Editar',
                    icon: 'create',
                    handler: async () => {
                        console.log('Editar contacto');
                        //Popup para editar contacto
                        if (sc.customerId) {
                            sc.customer = await this.getContacto(sc.customerId);
                        }
                        this.irAPopupContacto(event, sc);
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

        if (!this.keyword || this.keyword === "") {
            this.cargarContactosRegistrados();
            return;
        }
        let query = this.keyword.toLocaleLowerCase();
        this.searching = false;
        this.subjectCustomersFiltered = [];
        if (validateDNIPattern(query) && !(query.length > 9 && query.length < 14)) {
            this.cargarContactosRegistrados();
            return;
        } else if (validateDNIPattern(query) && query.length > 9 && query.length < 14) {
            this.searching = true;
        } else if (!validateDNIPattern(query) && query.length > 3) {
            this.searching = true;
        }

        if (this.searching) {
            this.subjectCustomersFiltered = this.buscarItemsFiltrados(this.subjectCustomers, query.trim());
            if (!this.subjectCustomersFiltered || (this.subjectCustomersFiltered && !this.subjectCustomersFiltered.length)) {
                this.cargarItemsFiltrados(await this.getContactosPorKeyword(query.trim()));
            } else {
                this.groupItems(this.subjectCustomersFiltered);
            }
        }
    }

    async cargarContactosRegistrados() {
        this.cargarItemsFiltrados(this.subjectCustomers);
        this.searching = false;
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
        this.searching = false;
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
            let caracter: any;
            sortedItems.forEach((value, index) => {

                value.customerPhoto = this.sanitizeIMG(value.customerPhoto);

                caracter = value.customerFullName.charAt(0).toLowerCase();
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
        this.searching = false;
    }

    sanitizeIMG(base64: any) {
        if (base64) {
            return this.sanitizer.bypassSecurityTrustResourceUrl(base64);
        }

        return null;
    }
}

//async onFilterItems(event) {
//        let query = event.target.value;
//        this.subjectCustomersFiltered = [];
//        if (query && query.length > 2 && query.length < 6) {
//            this.subjectCustomersFiltered = this.buscarItemsFiltrados(this.subjectCustomers, query.trim());
//            if (!this.subjectCustomersFiltered || (this.subjectCustomersFiltered && !this.subjectCustomersFiltered.length)) {
//                this.cargarItemsFiltrados(await this.getContactosPorKeyword(query.trim()));
//            } else {
//                this.groupItems(this.subjectCustomersFiltered);
//            }
//        } else {
//            if (!query) {
//                this.cargarItemsFiltrados(this.subjectCustomers);
//            }
//        }
//    }