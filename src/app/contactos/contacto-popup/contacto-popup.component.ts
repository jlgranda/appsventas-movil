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

    async cancel(event) {
        await this.modalController.dismiss(null);
    };

    async onFilterListItems(event) {
        let query = event.target.value;
        this.initialsList = [];
        if (query && query.length > 2) {
            this.initialsList = await this.getInitialsPorKeyword(query.toLowerCase());
            this.initialsListView = true;
        }
    }

    async buttonClick(event, item) {
        //Enviar la información del initials
        this.customer.initials = item;
        this.initialsListView = false;
    }

    selectOption(event) {
        let value = event.target.value;
        if (value) {
            this.movilImtem = this.movilList.find((item) => item.value === value);
        }
    }

    movilInput(event) {
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

    agregarMovil(event) {
        this.movilListSelect.push(2);
    }

    checkBox(event, item) {
        if (item == 'isCI') {
            this.isRUC = !event.target.checked;
        }else{
            this.isCI = !event.target.checked;
        }
    }
    
    async agregarSubjectCustomer(event, c: SubjectCustomer) {
        this.subjectCustomer = new SubjectCustomer();
        this.subjectCustomer.customer = this.customer;
        await this.modalController.dismiss( this.subjectCustomer);
    };

}
