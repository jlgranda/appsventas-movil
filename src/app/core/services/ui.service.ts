import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';

import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from "@angular/common/http";

import { environment } from "src/environments/environment";

import { AlertController, LoadingController, ToastController } from '@ionic/angular';


import { HttpErrorHandler, HandleError } from '../../http-error-handler.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class UIService {

    private apiServer = '';

    private currentUserSubject = new BehaviorSubject<User>({} as User);
    public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

    private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
    public isAuthenticated = this.isAuthenticatedSubject.asObservable();

    private handleError: HandleError;

    constructor(
        private apiService: ApiService,
        private jwtService: JwtService,
        public http: HttpClient,
        httpErrorHandler: HttpErrorHandler,
        private toastController: ToastController,
        private loadingController: LoadingController,
    ) {
        this.apiServer = environment.settings.apiServer;
        this.handleError = httpErrorHandler.createHandleError('UserService');
        console.log("UserService create on end point: ", this.apiServer);
    }

    async presentToast(message: string) {
        this.presentToastInit("dark", '', message, 'bottom');
    }

    async presentToastHeader(header: string, message: string) {
        this.presentToastInit("dark", header, message, 'bottom');
    }
    
    async presentToastHeaderTop(header: string, message: string) {
        this.presentToastInit("dark", header, message, 'top');
    }

    async presentToastSeverity(severity: string, message: string) {
        this.presentToastInit(severity == 'error' ? 'danger' : severity,
            severity == 'success' ? '¡Bien!' : severity == 'danger' ? '¡Error!' : '¡Advertencia!',
            message, 'bottom');
    }

    async presentToastSeverityHeader(severity: string, header: string, message: string) {
        this.presentToastInit(severity == 'error' ? 'danger' : severity,
            header, message, 'bottom');
    }

    async presentToastInit(color: string, header: string, message: string, position) {
        const toast = await this.toastController.create({
            message,
            duration: 1750,
            color,
            header,
            position,
            cssClass: 'my-toast-class'
        });
        toast.present();
    }

    ping(url: string): Observable<any> {
        return this.apiService.get(url)
            .pipe(
                catchError(this.handleError('ping', url))
            )
    }

    async presentLoading(duration: number) {
        const loading = await this.loadingController.create({
            message: 'Por favor espere...',
            duration,
            cssClass: 'my-loading-class',
        });
        await loading.present();
    }

}
