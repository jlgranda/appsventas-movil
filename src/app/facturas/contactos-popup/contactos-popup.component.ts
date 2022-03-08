import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MessageService } from 'primeng/api';
import { ContactoPopupComponent } from 'src/app/contactos/contacto-popup/contacto-popup.component';
import { ContactosService } from 'src/app/contactos/contactos.service';
import { UIService } from 'src/app/core';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';

@Component({
    selector: 'app-contactos-popup',
    templateUrl: './contactos-popup.component.html',
    styleUrls: ['./contactos-popup.component.scss']
})
export class ContactosPopupComponent implements OnInit {

    @Input() subjectCustomer: SubjectCustomer;

    subjectCustomers: SubjectCustomer[] = [];
    subjectCustomersFiltered: SubjectCustomer[] = [];
    groupedItems = [];

    //Auxiliares
    keyword: string;

    constructor(
        private uiService: UIService,
        private modalController: ModalController,
        private contactosService: ContactosService,
        private messageService: MessageService,
    ) { }

    ngOnInit() {
        this.cargarDatosRelacionados();
    }

    async cargarDatosRelacionados() {
        this.subjectCustomers = await this.getContactosPorUsuarioConectado();
        this.cargarItemsFiltrados(this.subjectCustomers);
    }

    async getContactosPorUsuarioConectado(): Promise<any> {
        return this.contactosService.getContactosPorUsuarioConectado().toPromise();
    }

    async getContactosPorKeyword(keyword: string): Promise<any> {
        return this.contactosService.getContactosPorKeyword(keyword).toPromise();
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
                        await this.modalController.dismiss(data);
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
