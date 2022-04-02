import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { UIService } from 'src/app/core';
import { CuentaBancaria } from 'src/app/modelo/CuentaBancaria';
import { environment } from 'src/environments/environment';
import { PerfilService } from '../../perfil.service';
import { InstitucionesBancariasPopupComponent } from '../instituciones-bancarias-popup/instituciones-bancarias-popup.component';

@Component({
    selector: 'app-cuenta-bancaria-popup',
    templateUrl: './cuenta-bancaria-popup.component.html',
    styleUrls: ['./cuenta-bancaria-popup.component.scss']
})
export class CuentaBancariaPopupComponent implements OnInit {

    @Input() cuentaBancaria: CuentaBancaria;

    initSave: boolean = false;
    tiposCuenta: any[];

    constructor(
        private modalController: ModalController,
        private uiService: UIService,
        private perfilService: PerfilService,
        private navCtrl: NavController,
    ) { }

    ngOnInit(): void {
        this.tiposCuenta = [
            { label: "AHORRO", value: "AHORRO" },
            { label: "CORRIENTE", value: "CORRIENTE" }
        ]
        this.cuentaBancaria.tipoCuenta = this.tiposCuenta[0]['value'];
        if (this.cuentaBancaria && this.cuentaBancaria.institucion) {
            this.cuentaBancaria.name = this.cuentaBancaria.institucion['value'];
        }
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    guardarCuentaBancaria(event, cb: CuentaBancaria) {
        this.initSave = true;
        if (this.cuentaBancaria) {
            //Guardar cuenta bancaria en persistencia
            this.perfilService.enviarCuentaBancaria(this.cuentaBancaria).subscribe(
                async (data) => {
                    this.uiService.presentToastSeverity("success", "Se registró la cuenta bancaria con éxito.");
                    this.initSave = false;
                    await this.modalController.dismiss(data);
                },
                (err) => {
                    this.uiService.presentToastSeverityHeader("error",
                        err["type"] ? err["type"] : '¡Ups!',
                        err["message"] ? err["message"] : environment.settings.errorMsgs.error500);
                }
            );
        }
    }

}
