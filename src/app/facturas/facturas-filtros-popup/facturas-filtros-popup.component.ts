import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { InvoiceCount } from 'src/app/modelo/InvoiceCount';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-facturas-filtros-popup',
    templateUrl: './facturas-filtros-popup.component.html',
    styleUrls: ['./facturas-filtros-popup.component.scss']
})
export class FacturasFiltrosPopupComponent implements OnInit {

    @Input() filtros: any[] = [];
    @Input() invoicesCountData: InvoiceCount[];

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

    async onSelectEstado(event, item, i) {
        if (item) {
            this.filtros = this.filtros.filter(val => val.key != 'estado');
            !this.filtros ? this.filtros = [] : this.filtros;
            this.filtros.unshift({ key: 'estado', value: item.internalStatus });
            await this.modalController.dismiss(this.filtros);
        }
    }

}
