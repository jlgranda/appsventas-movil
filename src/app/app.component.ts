import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import { UserService, UIService } from './core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController } from '@ionic/angular';
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

    constructor(private primengConfig: PrimeNGConfig,
        private router: Router,
        public userService: UserService,
        private uiService: UIService,
        public navCtrl: NavController,
        private socialSharing: SocialSharing,
        private androidPermissions: AndroidPermissions,
        private sanitizer: DomSanitizer) { }

    isAuthenticated: boolean;
    ngOnInit() {
        //this.primengConfig.ripple = true;
        //Verificar login y/o redireccionar según corresponda
        this.userService.populate();
    }

    salir(evt: any) {
        this.userService.purgeAuth();
        this.navCtrl.navigateRoot('login');
    }
    
    irAPerfil(evt: any) {
        this.navCtrl.navigateRoot('perfil');
        
    }
    
    sanitize(base64:any) {
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
}
