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
import { StorageService } from '../services/storage.service';
import { PerfilService } from '../perfil/perfil.service';

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
        private storageService: StorageService,
        private perfilService: PerfilService,
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
                    this.userService.currentUser.subscribe(async userData => {
                        this.currentUser = userData;
                        if (this.currentUser && this.currentUser['uuid']) {
                            if (this.currentUser.initials && this.currentUser.initials != 'RUC NO VALIDO') {
                                //Recargar la foto de usuario/organización desde la memoria
                                await this.cargarDataImage();
                                this.navCtrl.navigateRoot('facturas');
//                                this.navCtrl.navigateRoot('perfil/informacionbancaria');
                            } else {
                                this.uiService.presentToastHeaderTop("¡RUC INVÁLIDO!", "El número de RUC no es válido.");
                                this.navCtrl.navigateRoot('perfil/sri');
                            }
                        }
                    });
                }
            }
        );
    }

    async getUserImage(): Promise<any> {
        return this.perfilService.getUserImage().toPromise();
    }

    async getUserOrganizationImage(): Promise<any> {
        return this.perfilService.getUserOrganizationImage().toPromise();
    }

    async cargarDataImage() {
        if (!this.currentUser.image) {
            this.currentUser.image = await this.storageService.get('photoUser');
            if (!this.currentUser.image) {
                this.currentUser.image = await this.getUserImage()['imageUser'];
            }
        }
        if (this.currentUser.organization && !this.currentUser.organization.image) {
            this.currentUser.organization.image = await this.storageService.get('photoOrganization');
            if (!this.currentUser.organization.image) {
                this.currentUser.organization.image = await this.getUserOrganizationImage()['imageOrganization'];
            }
        }
    }

    ionTabsWillChange(event) {
        if (this.currentUser) {
            if (this.currentUser.initials && this.currentUser.initials != 'RUC NO VALIDO') {
            } else {
                this.uiService.presentToastHeaderTop("¡RUC INVÁLIDO!", "El número de RUC no es válido.");
                this.navCtrl.navigateRoot('perfil/sri');
            }
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
        this.navCtrl.navigateRoot('contactos');
        this.menu.close();
    }

    irAPerfil(evt: any) {
        if (this.currentUser) {
            if (this.currentUser.initials && this.currentUser.initials != 'RUC NO VALIDO') {
                this.navCtrl.navigateRoot('perfil');
            } else {
                this.uiService.presentToastHeaderTop("¡RUC INVÁLIDO!", "El número de RUC no es válido.");
                this.navCtrl.navigateRoot('perfil/sri');
            }
        }
        this.menu.close();
    }

    irASRI(evt: any) {
        this.navCtrl.navigateRoot('perfil/sri');
        this.menu.close();
    }
    
    irAInformacionBancaria(evt: any) {
        this.navCtrl.navigateRoot('perfil/informacionbancaria');
        this.menu.close();
    }
    
    irAFacturas(evt: any) {
        this.navCtrl.navigateRoot('facturas');
        this.menu.close();
    }

    irAServicios(evt: any) {
        this.navCtrl.navigateRoot('servicios');
        this.menu.close();
    }

}
