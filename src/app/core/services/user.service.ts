import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';

import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from "@angular/common/http";

import { environment } from "src/environments/environment";

import { AlertController, ToastController } from '@ionic/angular';


import { HttpErrorHandler, HandleError } from '../../http-error-handler.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserData } from 'src/app/modelo/user.data';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class UserService {

    private apiServer = '';

    private currentUserSubject = new BehaviorSubject<User>({} as User);
    public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

    private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
    public isAuthenticated = this.isAuthenticatedSubject.asObservable();

    private handleError: HandleError;

    constructor(
        private router: Router,
        private apiService: ApiService,
        public userService: UserService,
        private jwtService: JwtService,
        public http: HttpClient,
        httpErrorHandler: HttpErrorHandler,
        private toastController: ToastController
    ) {
        this.apiServer = environment.settings.apiServer;
        this.handleError = httpErrorHandler.createHandleError('UserService');
    }

    // Verify JWT in localstorage with server & load user's info.
    // This runs once on application startup.
    populate() {
        // If JWT detected, attempt to get & store user's info
        if (this.jwtService.getToken()) {

            this.apiService.get(this.apiServer + '/user')
                .subscribe(
                    data => this.setAuth(data['user']),
                    err => this.purgeAuth()
                );
        } else {
            // Remove any potential remnants of previous auth states
            this.purgeAuth();
        }
    }

    setAuth(user: User) {
        if (!user) {
            // Set isAuthenticated to true
            this.isAuthenticatedSubject.next(false);
        } else {
            // Save JWT sent from server in localstorage
            this.jwtService.saveToken(user.token);
            // Set current user data into observable
            this.currentUserSubject.next(user);
            // Set isAuthenticated to true
            this.isAuthenticatedSubject.next(true);
        }
    }

    setToken(user: User) {
        if (!user) {
            // Set isAuthenticated to true
            this.isAuthenticatedSubject.next(false);
        } else {
            // Save JWT sent from server in localstorage
            this.jwtService.saveToken(user.token);
        }
    }

    purgeAuth() {
        // Remove JWT from localstorage
        this.jwtService.destroyToken();
        // Set current user to an empty object
        this.currentUserSubject.next({} as User);
        // Set auth status to false
        this.isAuthenticatedSubject.next(false);
        localStorage.removeItem('ROL_SELECTED');

    }

    attemptAuth(type, credentials): Observable<User> {
        //const route = (type === 'login') ? '/login' : '';
        return this.postLogin(credentials.username, credentials.password)
            .pipe(map(
                data => {
                    let user: User = {
                        id: null,
                        email: "",
                        token: data['token'],
                        uuid: "",
                        username: "",
                        nombre: "",
                        bio: "",
                        image: "",
                        roles: [],
                        rolSelected: "",
                        mobileNumber: "",

                        //Datos de facturación
                        ruc: "",
                        initials: "",
                        direccion: "",

                        //Datos de organización
                        organization: null,

                    };
                    this.setToken(user);
                    this.populate();
                    return this.getCurrentUser();
                }
            ));
    }

    /**
    * Envia credenciales de inicio de sessión contra el servicio MAG
    */
    postLogin(user, pass) {

        const ubi_local = environment.api;
        const auth = environment.auth;
        var link = ubi_local + auth;
        //const credentciales = 'Basic ' + environment.credential_app;
        /*const head = new HttpHeaders({
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: '' + credentciales,
        });*/
        const head = new HttpHeaders({
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json;charset=utf-8",
            "X-Requested-With": "XMLHttpRequest"
        });

        const body = {
            "username": user,
            "password": pass
        }
        return this.http.post(link, JSON.stringify(body), { headers: head });

    }

    getCurrentUser(): User {
        return this.currentUserSubject.value;
    }

    getRoles(): string[] {
        //return [...this.getCurrentUser().roles,...['ROL_PRODUCTOR']] || [];
        return this.getCurrentUser().roles || [];
    }

    getRolSelected(): string {

        if (!this.getCurrentUser()) {
            return "UNDEFINED";
        }

        if (this.getCurrentUser().rolSelected) {
            return this.getCurrentUser().rolSelected;
        }

        return localStorage.getItem('ROL_SELECTED') || (this.getRoles()[0] ? this.getRoles()[0] : '')
    }

    // Update the user on the server (email, pass, etc)
    update(user: UserData): Observable<UserData> {
        return this.apiService
            .put(this.apiServer + '/user', user)
            .pipe(map(data => {
                // Update the currentUser observable
                this.currentUserSubject.next(data);
                return data;
            }));
    }
}
