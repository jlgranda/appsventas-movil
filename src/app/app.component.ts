import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import { UserService } from './core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController } from '@ionic/angular';

import { environment } from "src/environments/environment";

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
        public navCtrl: NavController,
        private sanitizer: DomSanitizer) { }

    isAuthenticated: boolean;
    ngOnInit() {
        this.primengConfig.ripple = true;
        //Verificar login y/o redireccionar según corresponda
        this.userService.populate();
    }

    salir(evt: any) {
        this.userService.purgeAuth();
    }
    
    irAPerfil(evt: any) {
        this.navCtrl.navigateRoot('/perfil');
        
    }
    
    sanitize(base64:any) {
        if (base64) {
            return this.sanitizer.bypassSecurityTrustResourceUrl(base64);
        }
        return null;
    }
}
