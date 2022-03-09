import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { User, UserService } from '../core';
import { Invoice } from '../modelo/Invoice';
import { InvoiceDetail } from '../modelo/InvoiceDetail';
import { Product } from '../modelo/Product';

import { NavController } from '@ionic/angular';

@Component({
    selector: 'app-inicio-page',
    templateUrl: './inicio.component.html',
    styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

    //Autenticación
    isAuthenticated: boolean;
    currentUser: User;

    constructor(
        private router: Router,
        public userService: UserService,
        private messageService: MessageService,
        public navCtrl: NavController
    ) {
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
                    this.navCtrl.navigateRoot('facturas');
                }
            }
        );
        //
        //                this.userService.currentUser.subscribe(userData => {
        //                    this.currentUser = userData;
        //                });

    }

}
