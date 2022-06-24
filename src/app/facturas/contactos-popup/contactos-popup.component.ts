import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { MessageService } from 'primeng/api';
import { ContactoPopupComponent } from 'src/app/contactos/contacto-popup/contacto-popup.component';
import { ContactosService } from 'src/app/contactos/contactos.service';
import { UIService } from 'src/app/core';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { validateDni } from 'src/app/shared/helpers';
import { validateRUC } from 'src/app/shared/helpers';
import { validateDNIPattern } from 'src/app/shared/helpers';

import { debounceTime } from "rxjs/operators";
import { AppComponent } from 'src/app/app.component';

@Component({
    selector: 'app-contactos-popup',
    templateUrl: './contactos-popup.component.html',
    styleUrls: ['./contactos-popup.component.scss']
})
export class ContactosPopupComponent implements OnInit {

    @Input() subjectCustomer: SubjectCustomer;

    //Variables con objeto de edición
    subjectCustomers: SubjectCustomer[] = [];
    subjectCustomersFiltered: SubjectCustomer[] = [];
    groupedItems = [];

    //Auxiliares
    keyword: string;
    searching: boolean = false;
    process: boolean = true;
    
    searchControl: FormControl;
    app: AppComponent;
    
    
    constructor(
        private uiService: UIService,
        private modalController: ModalController,
        private contactosService: ContactosService,
        private messageService: MessageService,
        private appController: AppComponent,
        private sanitizer: DomSanitizer
    ) {
        this.process = true;
        this.app = appController;
        this.searchControl = new FormControl();
    }

    ngOnInit() {
        this.cargarDatosRelacionados();
        this.searchControl.valueChanges
            .pipe(debounceTime(700))
            .subscribe(search => {
                this.onFilterItems(null);
            });
    }

    doRefresh(event) {
        this.cargarDatosRelacionados();
        setTimeout(() => {
            event.target.complete();
        }, 2000);
    }

    async cargarDatosRelacionados() {
        this.process = true;
        this.subjectCustomers = [];
        this.subjectCustomers = await this.contactosService.getContactosPorUsuarioConectadoData();
        this.cargarItemsFiltrados(this.subjectCustomers);
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async addSubjectCustomer(event, sc: SubjectCustomer) {
        //Enviar la información del contacto seleccionado
        this.subjectCustomer = sc;
        await this.modalController.dismiss(this.subjectCustomer);
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

        modal.onDidDismiss().then((modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                console.log(modalDataResponse.data);
                this.cargarDatosRelacionados();
                this.keyword = modalDataResponse.data['customerCode'];
                this.onFilterItems(null);
            }
        });

        return await modal.present();
    }

    /**
    ** Utilitarios
    */
    async onFilterItems(event) {
        this.process = true;
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
            if (!this.subjectCustomersFiltered || (this.subjectCustomersFiltered && (!this.subjectCustomersFiltered.length || this.subjectCustomersFiltered.length == 0))) {
                this.cargarItemsFiltrados(await this.contactosService.getContactosPorKeywordData(query.trim()));
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

                value.customerPhoto = this.app.sanitize(value.customerPhoto);
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
        this.process = false;
    }

}
