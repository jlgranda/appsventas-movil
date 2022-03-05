import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { User, UserService } from '../core';
import { Subject } from '../modelo/Subject';
import { Invoice } from '../modelo/Invoice';
import { InvoiceDetail } from '../modelo/InvoiceDetail';
import { Product } from '../modelo/Product';

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
    ) {
    }

    ngOnInit() {
        console.log("InicioComponent, preguntando por auth...");
        this.userService.isAuthenticated.subscribe(
            (authenticated) => {
                this.isAuthenticated = authenticated;

                // set the article list accordingly
                if (!this.isAuthenticated) {
                    this.router.navigate(['/login']);
//                    this.router.navigateByUrl('/');
                    return;
                } else {
//                    this.router.navigate(['facturas']);
                    this.router.navigate(['servicios']);
                }
            }
        );
//
//                this.userService.currentUser.subscribe(userData => {
//                    this.currentUser = userData;
//                });

        console.log("//Fin InicioComponent...");
    }
    
    verificarSincronizado(event:any){}

}
