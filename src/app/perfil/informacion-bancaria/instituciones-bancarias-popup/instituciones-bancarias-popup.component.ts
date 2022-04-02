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
    institucionesFiltrados: any[] = [];

    viewSearchList: boolean = false;
    keyword: string = "";

    @ViewChild('ionSearchbar', { read: ElementRef }) ionSearchbar: ElementRef;

    constructor(
        private uiService: UIService,
        private dataService: DataService,
        private modalController: ModalController,
        private router: Router,
        private navCtrl: NavController,
    ) { }

    async ngOnInit(): Promise<void> {
        this.instituciones = await this.getInstitucionesFinancierasData();
        this.institucionesFiltrados = this.instituciones;
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
        if (event) {
            let query = event.target.value;
            console.log(query);
            if (query && query.length > 2 && query.length < 6) {
                this.institucionesFiltrados = this.buscarItemsFiltrados(this.instituciones, query.trim());
            } else {
                if (!query) {
                    this.institucionesFiltrados = this.instituciones;
                }
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
        return filters;
    }

}
