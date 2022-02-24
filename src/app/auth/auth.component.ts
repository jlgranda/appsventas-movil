import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Message } from 'primeng/api';
import { MessageService } from 'primeng/api';

import { Errors, UserService } from '../core';

import * as CryptoJS from 'crypto-js';

import { environment } from "src/environments/environment";

@Component({
    selector: 'app-auth-page',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {
    authType: String = 'login';
    title: String = '';
    errors: Errors = { errors: {} };
    isSubmitting = false;
    authForm: FormGroup;

    username: string = '';
    password: string = '';

    enviromentUrl: string;
    msgs: Message[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private messageService: MessageService,
        private fb: FormBuilder
    ) {
        // use FormBuilder to create a form group
        this.authForm = this.fb.group({
            'username': ['', Validators.required],
            'password': ['', Validators.required]
        });
        this.enviromentUrl =  environment.api;
    }

    ngOnInit() {

        this.route.url.subscribe(data => {
            // Get the last piece of the URL (it's either 'login' or 'register')
            if (data[data.length - 1]) {
                this.authType = data[data.length - 1].path;
            }
            // Set a title for the page accordingly
            this.title = (this.authType === 'login') ? 'Ingresar' : 'Registrarse';
        });
    }

    submitForm(authForm: any) {
        this.messageService.clear(); //Borrar mensajes anteriores
        this.isSubmitting = true;
        this.errors = { errors: {} };

        //Encriptar contraseña
        var encrypted = CryptoJS.AES.encrypt(this.password, environment.credential_app);
        const credentials = {
            "username": this.username,
            "password": encrypted.toString()
        };

        if (this.username && this.password) {

            this.userService
                .attemptAuth(this.authType, credentials)
                .subscribe(
                    data => {
                        console.log("---------------------");
                        console.log("data:::", data);
                        console.log("---------------------");
                        this.router.navigate([''])
                    },
                    err => {
                        if (err['statusText']) {
                            this.messageService.add({ severity: 'error', summary: "Error", detail: `Se ha producido un error inesperado, es posible que el servidor no este disponible, intente nuevamente.` });
                            this.isSubmitting = false;
                        } else if (err["error"]) {
                            this.errors = err["error"];
                            if (this.errors['error'] && this.errors['error'] === 'invalid_grant' || this.errors['error'] === 'unauthorized') {
                                this.messageService.add({ severity: 'error', summary: 'Nombre usuario y contraseña no válidos', detail: `Verifique los datos ingresados e intente nuevamente.` });
                            } else {
                                this.messageService.add({ severity: 'error', summary: this.errors['type'], detail: `${this.errors['message']}` });
                            }
                            this.isSubmitting = false;
                        } else {
                            this.messageService.add({ severity: 'error', summary: "Error", detail: `Se ha producido un error interno. Verique las credenciales y conexión de acceso e intente nuevamente.` });
                            this.isSubmitting = false;
                        }
                    }
                );
        } else {
            this.messageService.add({ severity: 'error', summary: "Error", detail: `Ingrese el nombre de usuario y contraseña.` });
        }
    }
}
