import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationController, ModalController, NavController } from '@ionic/angular';
import { UIService } from 'src/app/core';
import { CuentaBancaria } from 'src/app/modelo/CuentaBancaria';
import { DataService } from 'src/app/services/data.service';
import { CuentaBancariaPopupComponent } from '../cuenta-bancaria-popup/cuenta-bancaria-popup.component';

@Component({
    selector: 'app-instituciones-bancarias-popup',
    templateUrl: './instituciones-bancarias-popup.component.html',
    styleUrls: ['./instituciones-bancarias-popup.component.scss']
})
export class InstitucionesBancariasPopupComponent implements OnInit {

    @Input() cuentaBancaria: CuentaBancaria;

    instituciones: any[] = [];
    institucionesFiltered: any[] = [];

    viewSearchList: boolean = false;
    keyword: string = "";

    @ViewChild('ionSearchbar', { read: ElementRef }) ionSearchbar: ElementRef;

    process: boolean = false;

    constructor(
        private uiService: UIService,
        private dataService: DataService,
        private modalController: ModalController,
        private router: Router,
        private navCtrl: NavController,
    ) { }

    async ngOnInit(): Promise<void> {
        this.cargarDatosRelacionados();
    }

    async cargarDatosRelacionados() {
        this.process = true;
        this.instituciones = [];

        this.instituciones = await this.getInstitucionesFinancierasData();
        this.institucionesFiltered = this.instituciones;
        this.process = false;
    }

    async getInstitucionesFinancierasData(): Promise<any> {
        return this.dataService.getInstitucionesFinancierasData().then();
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async addInstitucion($event, institucion: any) {
        this.cuentaBancaria.institucion = institucion;
        this.keyword = "";
        await this.modalController.dismiss(this.cuentaBancaria);
    }

    /**
    ** Utilitarios
    */
    viewSearch(event) {
        this.viewSearchList = true;
    }

    clearFilterItems(event) {
        if (event) {
            event.target.value = '';
            this.onFilterItems(event);
        }
    }

    onFilterItems(event) {
        this.process = true;
        let query = event.target.value;
        if (query && query.length > 3 && query.length < 6) {
            this.institucionesFiltered = this.buscarItemsFiltrados(this.instituciones, query.trim());
        } else {
            if (!query) {
                this.institucionesFiltered = this.instituciones;
                this.process = false;
            }
        }
    }

    buscarItemsFiltrados(items, query): any[] {
        let filters = [];
        if (items && items.length) {
            filters = items.filter(val =>
                (val.label && val.label.toLowerCase().includes(query.toLowerCase()))
            );
        }
        this.process = false;
        return filters;
    }

}
