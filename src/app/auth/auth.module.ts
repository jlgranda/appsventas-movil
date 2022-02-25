import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthComponent } from './auth.component';
import { NoAuthGuard } from './no-auth-guard.service';
import { SharedModule } from '../shared/';
import { AuthRoutingModule } from './auth-routing.module';

import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';

import { MarkAsteriskDirectiveModule } from '../directives/mark-asterisk.directive';

import { IonicModule } from '@ionic/angular';

@NgModule({
    imports: [
        IonicModule,
        FormsModule,
        CommonModule,
        MessagesModule,
        MessageModule,
        SharedModule,
        AuthRoutingModule,
        MarkAsteriskDirectiveModule
    ],
    declarations: [
        AuthComponent
    ],
    providers: [
        NoAuthGuard,
        MessageService
    ]
})
export class AuthModule { }
