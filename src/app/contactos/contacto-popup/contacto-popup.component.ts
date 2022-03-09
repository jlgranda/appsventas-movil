import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'src/app/modelo/Subject';
import { SubjectCustomer } from 'src/app/modelo/SubjectCustomer';
import { ContactosService } from '../contactos.service';

@Component({
    selector: 'app-contacto-popup',
    templateUrl: './contacto-popup.component.html',
    styleUrls: ['./contacto-popup.component.scss']
})
export class ContactoPopupComponent implements OnInit {

    @Input() subjectCustomer: SubjectCustomer;
    customer: Subject = new Subject();

    initialsList: string[] = [];
    initialsListView: boolean = true;

    movilImtem: any;
    movilList = [
        { name: 'Móvil', value: 'movil' },
        { name: 'Trabajo', value: 'work' }
    ];
    movilListSelect: any[] = [];

    isRUC: boolean = false;
    isCI: boolean = true;

    constructor(
        private contactosService: ContactosService,
        private modalController: ModalController,
    ) { }

    ngOnInit(): void {
        this.movilImtem = this.movilList.find((item) => item.value === 'movil');
        this.movilListSelect.push(1);
    }

    async getInitialsPorKeyword(keyword: string): Promise<any> {
        return this.contactosService.getInitialsPorKeyword(keyword).toPromise();
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async addSubjectCustomer(event) {
        this.subjectCustomer.customer = this.customer;
        await this.modalController.dismiss(this.subjectCustomer);
    };

    /**
    ** Utilitarios
    */
    async onFilterListItems(event) {
        let query = event.target.value;
        this.initialsList = [];
        if (query && query.length > 2 && query.length < 6) {
            this.initialsList = await this.getInitialsPorKeyword(query.toLowerCase());
            this.initialsListView = true;
        }
    }

    async onItem(event, item) {
        //Enviar la información del initials
        this.customer.initials = item.toUpperCase();
        this.initialsListView = false;
    }

    onSelectOption(event) {
        let value = event.target.value;
        if (value) {
            this.movilImtem = this.movilList.find((item) => item.value === value);
        }
    }

    onMovilInput(event) {
        let value = event.target.value;
        if (value) {
            switch (this.movilImtem.value) {
                case 'movil':
                    this.customer.mobileNumber = value;
                    break;
                case 'work':
                    this.customer.workPhoneNumber = value;
                    break;
            }
        }
    }

    onAddMovil(event) {
        this.movilListSelect.push(this.movilListSelect.length + 1);
    }

}
