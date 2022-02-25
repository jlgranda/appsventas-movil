import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../http-interceptors/auth-interceptor';

import {
  ApiService,
  AuthGuard,
  JwtService,
  ProfilesService,
  UserService,
  TareaService,
} from './services/';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ApiService,
    AuthGuard,
    JwtService,
    ProfilesService,
    UserService,
    TareaService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class CoreModule { }
