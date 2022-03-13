import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { UIService, User, UserService } from '../core';
import { Invoice } from '../modelo/Invoice';
import { InvoiceDetail } from '../modelo/InvoiceDetail';
import { Product } from '../modelo/Product';

import { MenuController, NavController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { PerfilComponent } from '../perfil/perfil/perfil.component';

@Component({
    selector: 'app-inicio-page',
    templateUrl: './inicio.component.html',
    styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

    //Autenticación
    isAuthenticated: boolean;
    currentUser: User;

    app: AppComponent;
    perfil: PerfilComponent;

    constructor(
        private router: Router,
        public userService: UserService,
        private messageService: MessageService,
        public navCtrl: NavController,
        private appController: AppComponent,
        private menu: MenuController,
        private perfilController: PerfilComponent,
        private uiService: UIService,
    ) {
        this.app = appController;
        this.perfil = perfilController;
    }

    ngOnInit() {
        this.userService.isAuthenticated.subscribe(
            (authenticated) => {
                this.isAuthenticated = authenticated;

                // set the article list accordingly
                if (!this.isAuthenticated) {
                    this.navCtrl.navigateRoot('login');
                    return;
                } else {
                    //                    this.navCtrl.navigateRoot('facturas');
                    this.userService.currentUser.subscribe(userData => {
                        this.currentUser = userData;
                        if (this.currentUser.initials && this.currentUser.initials == 'RUC NO VALIDO') {
                            this.navCtrl.navigateRoot('perfil');
                        } else {
                            this.navCtrl.navigateRoot('facturas');
                        }
                    });
                }
            }
        );
    }


    ionTabsWillChange(event) {
        if (this.currentUser.initials && this.currentUser.initials == 'RUC NO VALIDO') {
            this.uiService.presentToastHeaderTop("¡RUC INVÁLIDO!", "El número de RUC no es válido.");
            this.navCtrl.navigateRoot('perfil');
        }
    }

    openFirst() {
        this.menu.enable(true, 'first');
        this.menu.open('first');
    }

    openEnd() {
        this.menu.open('end');
    }

    openCustom() {
        this.menu.enable(true, 'custom');
        this.menu.open('custom');
    }

    irAContactos(evt: any) {
        this.navCtrl.navigateRoot('/contactos');
        this.menu.close();
    }

    irAPerfil(evt: any) {
        this.navCtrl.navigateRoot('/perfil');
        this.menu.close();
    }

    irAFacturas(evt: any) {
        this.navCtrl.navigateRoot('/facturas');
        this.menu.close();
    }

    irAServicios(evt: any) {
        this.navCtrl.navigateRoot('/servicios');
        this.menu.close();
    }

}
