import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Message } from 'primeng/api';
import { MessageService } from 'primeng/api';

import { Errors, UserService, UIService } from '../core';

import * as CryptoJS from 'crypto-js';

import { environment } from "src/environments/environment";

@Component({
    selector: 'app-auth-page',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
    authType: String = 'login';
    title: String = '';
    errors: Errors = { errors: {} };
    isSubmitting = false;
    authForm: FormGroup;

    data: any;
    events: any;


    username: string = 'jlgranda81@gmail.com';
    password: string = 'jlgr4nd4';

    public isUsernameValid: boolean;
    public isPasswordValid: boolean;

    msgs: Message[] = [];

    autenticadorDisponible: boolean = false;
    apiDisponible: boolean = false;
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private uiService: UIService,
        private messageService: MessageService,
        private fb: FormBuilder
    ) {
        // use FormBuilder to create a form group
        this.authForm = this.fb.group({
            'username': ['', Validators.required],
            'password': ['', Validators.required]
        });
        
        this.isUsernameValid= true;
        this.isPasswordValid = true;
        
        this.data = this.getDataForLoginFlat();
//        this.events =  {
//            "onLogin" : this.onLogin
//          }
    }

    async ngOnInit() {
        
        this.route.url.subscribe(data => {
            // Get the last piece of the URL (it's either 'login' or 'register')
            if (data[data.length - 1]) {
                this.authType = data[data.length - 1].path;
            }
            // Set a title for the page accordingly
            this.title = (this.authType === 'login') ? 'Ingresar' : 'Registrarse';
        });
        
        await this.validarServicios();
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
                        this.router.navigate([''])
                    },
                    err => {
                        if (err['statusText'] && err['statusText'] != "Unauthorized") {
                            this.messageService.add({ severity: 'error', summary: "¡Ups!", detail: `Se ha producido un error inesperado, es posible que el servidor no este disponible, intente nuevamente.` });
                            this.isSubmitting = false;
                        } else if (err['status'] && err['status'] == 401) {
                            this.messageService.add({ severity: 'error', summary: "¡Ups!", detail: `Revise el nombre de usuario y/o contraseña, vuelva a intentar.` });
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
    
    //Validación de servicios
    async validarServicios() {
        
       const token_url = environment.api + environment.auth;

        const servicios: any = await this.getPing(environment.api + "ping");
        
        if (servicios['version']) {
            this.autenticadorDisponible = true;
            this.uiService.presentToast("Autenticador disponible.");
        } else {
            this.uiService.presentToast("Autenticador no disponible.");
        }
        
        const servicios2: any = await this.getPing(environment.settings.apiServer + "/ping");

        if (servicios2['version']) {
            this.apiDisponible = true;
            this.uiService.presentToast("API disponible. ");
        } else {
            this.uiService.presentToast("API no disponible. ");
        }
    }
    
    public getPing(url: string): Promise<any> {
        return this.uiService.ping(url).toPromise();
    }
    
    onEvent = (event: string): void => {
        if (event == "onLogin" && !this.validate()) {
            return ;
        }
        if (this.events[event]) {
            this.events[event]({
                'username': this.username,
                'password': this.password
            });
        }        
    }

    validate():boolean {
        this.isUsernameValid = true;
        this.isPasswordValid = true;
        if (!this.username ||this.username.length == 0) {
            this.isUsernameValid = false;
        }

        if (!this.password || this.password.length == 0) {
            this.isPasswordValid = false;
        }
        
        return this.isPasswordValid && this.isUsernameValid;
    }
    
    /*  Login Universal Data
    ==============================*/
    getDataForLoginFlat = () => {
        let data = {
            "logo": "/assets/layout/images/login/logo-appsventas-v2.png",
            "btnLogin": "Siguiente",
            "txtUsername" : "Usuario",
            "txtPassword" : "Contraseña",
            "txtForgotPassword" : "¿Olvido la contraseña?",
            "btnResetYourPassword": "Reestablecer contraseña",
            "txtSignupnow" : "¿No tiene una cuenta?",
            "btnSignupnow": "Registrarse ahora",
            "title": "Tus facturas FAZil",
            "subtitle": "de appsventas",
            "version": "versión 0.23",
            "errorUser" : "Se necesita un nombre de usuario.",
            "errorPassword" : "Se necesita una contraseña."
        };
        return data;
    };
}

