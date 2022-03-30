import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { UIService, User, UserService } from 'src/app/core';
import { CuentaBancaria } from 'src/app/modelo/CuentaBancaria';
import { PerfilService } from '../perfil.service';

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

    constructor(
        public userService: UserService,
        private uiService: UIService,
        private perfilService: PerfilService,
        private loadingController: LoadingController,
    ) { }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
            if (this.currentUser) {
                if (this.currentUser.initials && this.currentUser.initials != 'RUC NO VALIDO') {
                    this.valido = true;
                    this.cargarDatosRelacionados();
                }
            }
        });
    }

    async cargarDatosRelacionados() {
        this.uiService.presentLoading(200);
        this.cuentasBancarias = await this.getCuentasBancariasPorOrganizacionDeUsuarioConectado();
    }

    async getCuentasBancariasPorOrganizacionDeUsuarioConectado(): Promise<any> {
        return this.perfilService.getCuentasBancariasPorOrganizacionDeUsuarioConectado().toPromise();
    }

}
