import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, LoadingController, ModalController } from '@ionic/angular';
import { UIService } from 'src/app/core';
import { Invoice } from 'src/app/modelo/Invoice';
import { ComprobantesService } from 'src/app/services/comprobantes.service';
import { FacturasFiltrosPopupComponent } from '../facturas-filtros-popup/facturas-filtros-popup.component';
import * as moment from 'moment';

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
    enabledTotals: boolean = false;
    filtros: any[] = [];

    constructor(
        private modalController: ModalController,
        private uiService: UIService,
        private loadingController: LoadingController,
        private comprobantesService: ComprobantesService,
        private actionSheetController: ActionSheetController,
    ) {
        moment.locale('es');
    }

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
        this.uiService.presentLoading(1000);
        this.facturasFiltrados = this.facturas;
        this.tieneFacturas = this.facturas.length > 0; //Para mostrar el buscador si hay en que buscar
    }

    getComprobantesPorUsuarioConectado(): Promise<any> {
        //return this.comprobantesService.getComprobantesPorUsuarioConectado('factura').toPromise();
        return this.comprobantesService.getFacturasEmitidasPorUsuarioConectado().toPromise();
    }

    getComprobantesPorUsuarioConectadoYEstado(estado: string): Promise<any> {
        return this.comprobantesService.getFacturasEmitidasPorUsuarioConectadoYEstado(estado).toPromise();
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async irAPopupFiltros(event) {
        const modal = await this.modalController.create({
            component: FacturasFiltrosPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-filter-class',
            componentProps: {
                'filtros': this.filtros,
            }
        });

        modal.onDidDismiss().then(async (modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.filtros = modalDataResponse.data;
                console.log(this.filtros);
                let filtroEstado = this.filtros.find(item => item.key == 'estado');
                if (filtroEstado) {
                    this.onFilterItemsPorEstado(filtroEstado.value);
                } else {
                    this.onFilterItemsPorEstado(null);
                }
            }
        });

        return await modal.present();
    }

    async presentarOpcionesActionSheet(event, item) {
        const actionSheet = await this.actionSheetController.create({
            header: 'OPCIONES',
            cssClass: 'my-actionsheet-class',
            buttons: item.internalStatus == 'CREATED' ?
                [
                    {
                        text: 'Emitir',
                        role: 'destructive',
                        icon: 'send',
                        cssClass: 'primary',
                        handler: () => {
                            console.log('Emitir factura');
                        }
                    }, {
                        text: 'Cancelar',
                        icon: 'close',
                        role: 'cancel',
                        handler: () => {
                            console.log('Cancelar');
                        }
                    }]
                : [{
                    text: 'Cancelar',
                    icon: 'close',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancelar');
                    }
                }]
        });
        await actionSheet.present();

        const { role, data } = await actionSheet.onDidDismiss();
    }

    /**
    ** Utilitarios
    */
    getDifferenceInDays(date1, date2) {
        const diffInMs = Math.abs(date2 - date1);
        return diffInMs / (1000 * 60 * 60 * 24);
    }

    async onFilterItemsPorEstado(estado: string) {
        this.facturasFiltrados = [];

        const loading = await this.loadingController.create({
            message: 'Por favor espere...',
            cssClass: 'my-loading-class',
        });
        await loading.present();
        //Facturas enviadas
        if (!estado) {
            this.facturas = await this.getComprobantesPorUsuarioConectado();
        } else {
            this.facturas = await this.getComprobantesPorUsuarioConectadoYEstado(estado);
        }
        if (this.facturas && this.facturas.length) {
            this.facturas.forEach((element) => {
                if (this.getDifferenceInDays(new Date(element.emissionOn), new Date()) < 16) {
                    element.fechaEmision = moment(element.emissionOn.toString()).fromNow();
                } else {
                    element.fechaEmision = moment(element.emissionOn.toString()).calendar();
                }
            });
            this.tieneFacturas = this.facturas.length > 0; //Para mostrar el buscador si hay en que buscar

            this.facturasFiltrados = this.facturas;
        }
        setTimeout(() => {
            loading.dismiss();
        });
    }

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

    viewTotals(event) {
        this.enabledTotals = !this.enabledTotals;
    }

}
