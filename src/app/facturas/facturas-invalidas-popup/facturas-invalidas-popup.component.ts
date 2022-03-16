import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Invoice } from 'src/app/modelo/Invoice';

@Component({
    selector: 'app-facturas-invalidas-popup',
    templateUrl: './facturas-invalidas-popup.component.html',
    styleUrls: ['./facturas-invalidas-popup.component.scss']
})
export class FacturasInvalidasPopupComponent implements OnInit {

    @Input() facturas: Invoice[];
    facturasFiltrados: Invoice[] = [];

    //Auxiliares
    keyword: string;
    tieneFacturas: boolean = false;

    constructor(
        private modalController: ModalController,
    ) { }

    ngOnInit(): void {
        this.facturasFiltrados = this.facturas;
        console.log(this.facturas);
        this.tieneFacturas = this.facturas.length > 0; //Para mostrar el buscador si hay en que buscar
        console.log(this.tieneFacturas);
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    /**
    ** Utilitarios
    */
    onFilterItems(event) {
        let query = event.target.value;
        if (query && query.length > 2 && query.length < 6) {
            this.facturasFiltrados = this.buscarItemsFiltrados(this.facturas, query.trim(), 'emitted');
        } else {
            if (!query) {
                this.facturasFiltrados = this.facturas;
            }
        }
    }

    buscarItemsFiltrados(items, query, camp): any[] {
        let filters = [];
        if (items && items.length) {
            filters = items.filter(val =>
                (camp == 'emitted' && val.customerFullName && val.customerFullName.toLowerCase().includes(query.toLowerCase()))
                || (camp == 'received' && val.subjectFullName && val.subjectFullName.toLowerCase().includes(query.toLowerCase()))
            );
        }
        return filters;
    }

}
