import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppComponent } from 'src/app/app.component';
import { UIService } from 'src/app/core';
import { Invoice } from 'src/app/modelo/Invoice';
import { ComprobantesService } from 'src/app/services/comprobantes.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

@Component({
    selector: 'app-factura-sri-popup',
    templateUrl: './factura-sri-popup.component.html',
    styleUrls: ['./factura-sri-popup.component.scss']
})
export class FacturaSriPopupComponent implements OnInit {

    @Input() factura: Invoice;

    facturaDataSri: any[];
    resultData: string = "";
    app: AppComponent;

    constructor(
        private modalController: ModalController,
        private comprobantesService: ComprobantesService,
        private uiService: UIService,
        private appController: AppComponent,
    ) {
        this.app = appController;
        moment.locale('es');
    }

    ngOnInit(): void {
        if (this.factura && this.factura.id) {
            this.facturaDataSri = [
                { label: 'Tipo de comprobante', value: 'Factura' },
                { label: 'Clave acceso', value: this.factura.claveAcceso ? this.factura.claveAcceso : 'No definido' },
                { label: 'No. Autorización', value: this.factura.numeroAutorizacion ? this.factura.numeroAutorizacion : 'No definido' },
                { label: 'Identificación receptor', value: this.factura.customerRUC ? this.factura.customerRUC : 'No definido' },
                { label: 'Fecha autorización(dd/mm/aaaa)', value: this.factura.authorizationDate ? moment(this.factura.authorizationDate.toString()).format("DD/MM/YYYY") : 'No definido' },
                { label: 'Correo electrónico receptor', value: this.factura.customerEmail ? this.factura.customerEmail : 'No definido' },
            ];
            if (this.facturaDataSri && this.facturaDataSri.length) {
                this.facturaDataSri.forEach((val) => {
                    this.resultData = this.resultData + '\n' + val.label + ': ' + val.value;
                });
            }
        }
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async compartirFactura(event) {
        if (this.resultData && this.factura && this.factura.uuid) {
            const title = `Hola estos son los datos de la factura a anular`
            const summary = `${title}\n${this.resultData}\n\nFue muy FAZil enviarte estos datos, consigue la app FAZil`
            const url = environment.settings.app.contact.url;
            this.app.sendShare(summary, title, url);
        }
    }

    async anularFactura(event) {
        if (this.factura && this.factura.uuid) {
            //Guardar en persistencia
            this.comprobantesService.enviarFacturaAnulada(this.factura).subscribe(
                async (data) => {
                    this.uiService.presentToastSeverity("success", "Factura marcada como anulada.");
                    await this.modalController.dismiss(this.factura);
                },
                async (err) => {
                    this.uiService.presentToastSeverityHeader("error",
                        err["type"] ? err["type"] : '¡Ups!',
                        err["message"] ? err["message"] : environment.settings.errorMsgs.error500);
                }
            );
        }
    }

}
