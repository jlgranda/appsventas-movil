import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import { UserService, UIService, User } from './core';
import { DomSanitizer } from '@angular/platform-browser';
import { MenuController, NavController } from '@ionic/angular';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';

import { environment } from "src/environments/environment";
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

    topbarColor = 'layout-topbar-blue';

    menuColor = 'layout-menu-light';

    themeColor = 'blue';

    layoutColor = 'blue';

    topbarSize = 'large';

    horizontal = true;

    inputStyle = 'outlined';

    ripple = true;

    compactMode = false;

    //Autenticación
    isAuthenticated: boolean;
    currentUser: User;

    constructor(private primengConfig: PrimeNGConfig,
        private router: Router,
        public userService: UserService,
        private uiService: UIService,
        public navCtrl: NavController,
        private socialSharing: SocialSharing,
        private androidPermissions: AndroidPermissions,
        private sanitizer: DomSanitizer,
        private menu: MenuController,) { }

    ngOnInit() {
        //this.primengConfig.ripple = true;
        //Verificar login y/o redireccionar según corresponda
        this.userService.populate();
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
        });
    }

    salir(evt: any) {
        this.userService.purgeAuth();
        this.navCtrl.navigateRoot('login');
    }


    sanitize(base64: any) {
        if (base64) {
            return this.sanitizer.bypassSecurityTrustResourceUrl(base64);
        }
        return null;
    }

    sendShare(message, subject, url) {
        this.socialSharing.share(message, subject, null, url);
    }

    getPermission() {
        this.androidPermissions.checkPermission(
            this.androidPermissions.PERMISSION.READ_PHONE_STATE
        ).then(res => {
            if (res.hasPermission) {
                this.uiService.presentToast('Permisos de lectura de estado del dispositivo habilitados');
            } else {
                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE).then(res => {
                    this.uiService.presentToastSeverity("warning", "Permisos de aplicación habiltiados.")
                }).catch(error => {
                    this.uiService.presentToastSeverity("error", "" + error);
                });
            }
        }).catch(error => {
            this.uiService.presentToastSeverity("error", "" + error);
        });

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
