import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-facturas-filtros-popup',
    templateUrl: './facturas-filtros-popup.component.html',
    styleUrls: ['./facturas-filtros-popup.component.scss']
})
export class FacturasFiltrosPopupComponent implements OnInit {

    @Input() filtros: any[] = [];

    estadosFactura = [
        { name: 'CREATED', value: 'CREATED', color: 'success' },
        { name: 'POSTED', value: 'POSTED', color: 'secondary'},
        { name: 'REJECTED', value: 'REJECTED', color: 'tertiary' },
        { name: 'INVALID', value: 'INVALID', color: 'danger' },
    ];
    tagDefaultColor: any;

    constructor(
        private modalController: ModalController,
    ) { }

    ngOnInit(): void {
        //Controlar los filtros
//        let filtroEstado = this.filtros.find(item => item.key == 'estado');
//        if (filtroEstado) {
//            let index = this.estadosFactura.indexOf(this.estadosFactura.find(item => item.value == filtroEstado.value));
//            this.tagDefaultColor[index] = "primary";
//        }
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(this.filtros);
    };

    async resetFilter(event) {
//        this.tagDefaultColor = Array(this.estadosFactura.length).fill("dark");
        this.filtros = [];
        await this.modalController.dismiss(this.filtros);
    };

    onSelectEstado(event, item, i) {
        if (item) {
            //Cambiar el color al seleccionado
//            this.tagDefaultColor = Array(this.estadosFactura.length).fill("dark");
//            if (this.tagDefaultColor[i] === "dark") {
//                this.tagDefaultColor[i] = "primary";
//            } else {
//                this.tagDefaultColor[i] = "dark"
//            }
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
