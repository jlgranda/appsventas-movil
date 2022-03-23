import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-facturas-filtros-popup',
    templateUrl: './facturas-filtros-popup.component.html',
    styleUrls: ['./facturas-filtros-popup.component.scss']
})
export class FacturasFiltrosPopupComponent implements OnInit {

    @Input() filtros: any[] = [];

    internalStatusInvoice = environment.properties.internalStatusInvoice;
    constructor(
        private modalController: ModalController,
    ) { }

    ngOnInit(): void {
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(this.filtros);
    };

    async resetFilter(event) {
        this.filtros = [];
        await this.modalController.dismiss(this.filtros);
    };

    onSelectEstado(event, item, i) {
        if (item) {
            this.addFilter(item);
        }
    }

    async addFilter(item) {
        if (this.filtros && this.filtros.length) {
            this.filtros = this.filtros.filter(val => val.key != 'estado');
        }
        if (!this.filtros) {
            this.filtros = [];
        }
        let filtro = { key: 'estado', value: item.value };
        this.filtros.unshift(filtro);
        await this.modalController.dismiss(this.filtros);
    }

}
