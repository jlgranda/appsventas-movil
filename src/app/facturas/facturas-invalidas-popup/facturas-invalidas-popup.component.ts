import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UIService } from 'src/app/core';
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
        private uiService: UIService,
    ) { }

    ngOnInit(): void {
        this.cargarDatosRelacionados();
    }

    doRefresh(event) {
        console.log('Begin async operation');
        this.cargarDatosRelacionados();
        setTimeout(() => {
            console.log('Async operation has ended');
            event.target.complete();
        }, 2000);
    }

    async cargarDatosRelacionados() {
        this.uiService.presentLoading(500);
        this.facturasFiltrados = this.facturas;
        this.tieneFacturas = this.facturas.length > 0; //Para mostrar el buscador si hay en que buscar
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
