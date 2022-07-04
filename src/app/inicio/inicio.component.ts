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
import { environment } from 'src/environments/environment';

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

    appConfig = environment.settings;

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

    /**
    Arranque de la aplicación
    */
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
                        this.currentUser = userData['user'] ? userData['user'] : userData;
                        if (this.currentUser && this.currentUser.uuid) {
                            if (this.currentUser.initials && this.currentUser.initials != 'RUC NO VALIDO') {
                                //Recargar la foto de usuario/organización desde la memoria
                                await this.cargarDataImage();
                                this.navCtrl.navigateRoot('facturas/emitir');
                            } else {
                                this.navCtrl.navigateRoot('perfil/sri');
                                this.uiService.presentToastSeverityHeader("error", "¡UPS!", this.appConfig.validationMsgs.rucValid);
                            }
                        }
                    });
                }
            }
        );
    }

    async cargarDataImage() {
        if (!this.currentUser.image) {
            this.currentUser.image = await this.storageService.get('photoUser');
            if (!this.currentUser.image) {
                this.currentUser.image = await this.perfilService.getUserImageData()['imageUser'];
            }
        }
        if (this.currentUser.organization && !this.currentUser.organization.image) {
            this.currentUser.organization.image = await this.storageService.get('photoOrganization');
            if (!this.currentUser.organization.image) {
                this.currentUser.organization.image = await this.perfilService.getUserOrganizationImageData()['imageOrganization'];
            }
        }
    }

    ionTabsWillChange(event) {
        if (this.currentUser) {
            if (!(this.currentUser.initials && this.currentUser.initials != 'RUC NO VALIDO')) {
                this.navCtrl.navigateRoot('perfil/sri');
                this.uiService.presentToastSeverityHeader("error", "¡UPS!", this.appConfig.validationMsgs.rucValid);
            }
        }
    }

}
