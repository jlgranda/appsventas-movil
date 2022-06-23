import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { AppComponent } from 'src/app/app.component';
import { UIService, User, UserService } from 'src/app/core';
import { CuentaBancaria } from 'src/app/modelo/CuentaBancaria';
import { Organization } from 'src/app/modelo/Organization';
import { DataService } from 'src/app/services/data.service';
import { PerfilService } from '../perfil.service';
import { CuentaBancariaPopupComponent } from './cuenta-bancaria-popup/cuenta-bancaria-popup.component';
import { InstitucionesBancariasPopupComponent } from './instituciones-bancarias-popup/instituciones-bancarias-popup.component';

import { environment } from "src/environments/environment";

@Component({
    selector: 'app-informacion-bancaria',
    templateUrl: './informacion-bancaria.component.html',
    styleUrls: ['./informacion-bancaria.component.scss']
})
export class InformacionBancariaComponent implements OnInit {

    //INITIAL
    currentUser: User;
    cuentasBancarias: CuentaBancaria[] = [];

    valido: boolean = false;

    app: AppComponent;

    constructor(
        public userService: UserService,
        private uiService: UIService,
        private perfilService: PerfilService,
        private dataService: DataService,
        private loadingController: LoadingController,
        private modalController: ModalController,
        private appController: AppComponent,
    ) { 
        this.app = appController;
    }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            if (this.currentUser) {
                let imagen = this.app.sanitize(this.currentUser.image);
                this.currentUser.image = typeof (imagen) == 'string' ? imagen : null;
                if (this.currentUser.initials && this.currentUser.initials != 'RUC NO VALIDO') {
                    this.valido = true;
                    this.cargarDatosRelacionados();
                }
            }
        });
    }

    doRefresh(event) {
        this.cargarDatosRelacionados();
        setTimeout(() => {
            event.target.complete();
        }, 2000);
    }

    async cargarDatosRelacionados() {
        this.uiService.presentLoading(200);
        this.cuentasBancarias = await this.getCuentasBancariasPorOrganizacionDeUsuarioConectado();
    }

    async getCuentasBancariasPorOrganizacionDeUsuarioConectado(): Promise<any> {
        return this.perfilService.getCuentasBancariasPorOrganizacionDeUsuarioConectado().toPromise();
    }

    async irAPopupInstituciones(event, cb: CuentaBancaria) {
        if (!cb) {
            cb = new CuentaBancaria();
        }
        const modal = await this.modalController.create({
            component: InstitucionesBancariasPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-class',
            componentProps: {
                'cuentaBancaria': cb,
            }
        });

        modal.onDidDismiss().then(async (modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.irAPopupCuentaBancaria(event, modalDataResponse.data);
            }
        });

        return await modal.present();
    }
    
    async irAPopupCuentaBancaria(event, cb: CuentaBancaria) {
        if (!cb) {
            cb = new CuentaBancaria();
        }
        const modal = await this.modalController.create({
            component: CuentaBancariaPopupComponent,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            cssClass: 'my-modal-class',
            componentProps: {
                'cuentaBancaria': cb,
            }
        });

        modal.onDidDismiss().then(async (modalDataResponse) => {
            if (modalDataResponse && modalDataResponse.data) {
                this.cargarDatosRelacionados();
            }
        });

        return await modal.present();
    }

    compartirCuentaBancaria($event, cb: CuentaBancaria) {
        //Enviar datos de la cuenta

        const title = `Hola estos son mis datos para la transferencia`
        //const summary = `${title}\n${this.currentUser.surname} ${this.currentUser.firstname}\n${cb.name}\n${cb.tipoCuenta} # ${cb.code}\n${this.currentUser.username}\n${this.currentUser.organization.ruc}\n\nConsigue la app FAZil y ten siempre a la mano estos datos`
        //TODO, indicar si la cuenta es personal o de empresa, si es de empresa tomaria datos desde la organización
        const summary = `${title}\n${this.currentUser.surname} ${this.currentUser.firstname}\n${cb.name}\n${cb.tipoCuenta} # ${cb.code}\n${this.currentUser.username}\n${this.currentUser.code}\n\nFue muy FAZil enviarte estos datos, consigue la app FAZil`
        const url= environment.settings.app.contact.url;
        this.app.sendShare(summary, title, url);
    }

}
