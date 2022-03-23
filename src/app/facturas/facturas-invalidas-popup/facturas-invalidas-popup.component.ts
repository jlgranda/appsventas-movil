import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, LoadingController, ModalController } from '@ionic/angular';
import { UIService } from 'src/app/core';
import { Invoice } from 'src/app/modelo/Invoice';
import { ComprobantesService } from 'src/app/services/comprobantes.service';
import { FacturasFiltrosPopupComponent } from '../facturas-filtros-popup/facturas-filtros-popup.component';
import * as moment from 'moment';
import { environment } from "src/environments/environment";
import { InvoiceCount } from 'src/app/modelo/InvoiceCount';

@Component({
    selector: 'app-facturas-invalidas-popup',
    templateUrl: './facturas-invalidas-popup.component.html',
    styleUrls: ['./facturas-invalidas-popup.component.scss']
})
export class FacturasInvalidasPopupComponent implements OnInit {

    @Input() invoicesCountData: InvoiceCount[];

    facturas: Invoice[] = [];
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
        this.invoicesCountData = this.invoicesCountData;
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
                'invoicesCountData': this.invoicesCountData,
            }
        });

        modal.onDidDismiss().then(async (modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.filtros = modalDataResponse.data;
                console.log(this.filtros);
                let filter = this.filtros.find(item => item.key == 'estado');
                if (filter) {
                    this.onFilterItemsPorEstado(filter.value);
                } else {
                    this.onFilterItemsPorEstado('NO_APPLIED');
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
                        text: 'Enviar y Autorizar',
                        role: 'destructive',
                        icon: 'check',
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

    onSelectEstado(event, item, i) {
        if (item) {
            this.onFilterItemsPorEstado(item.internalStatus);
        }
    }

    async onFilterItemsPorEstado(estado: string) {

        const loading = await this.loadingController.create({
            message: 'Por favor espere...',
            cssClass: 'my-loading-class',
        });
        await loading.present();

        //Facturas enviadas
        this.facturas = await this.getComprobantesPorUsuarioConectadoYEstado(estado);
        this.cargarDatosFacturasEnviadas();

        setTimeout(() => {
            loading.dismiss();
        });
    }

    cargarDatosFacturasEnviadas() {
        //Facturas enviadas
        this.facturasFiltrados = [];
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

    /**
    ** Utilitarios
    */
    getDifferenceInDays(date1, date2) {
        const diffInMs = Math.abs(date2 - date1);
        return diffInMs / (1000 * 60 * 60 * 24);
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
