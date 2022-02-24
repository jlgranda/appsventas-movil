import { MarkAsteriskDirectiveModule } from './../directives/mark-asterisk.directive';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';


import { ListErrorsComponent } from './list-errors.component';
import { ShowAuthedDirective } from './show-authed.directive';
import { RepeatValueDirective } from './directives/repeat-value.directive';

import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import {AutoCompleteModule} from 'primeng/autocomplete';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MessageModule,
    DialogModule,
    AutoCompleteModule,
    MarkAsteriskDirectiveModule
  ],
  declarations: [
    ListErrorsComponent,
    ShowAuthedDirective,
    RepeatValueDirective
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ListErrorsComponent,
    RouterModule,
    ShowAuthedDirective,
    RepeatValueDirective
  ],
  providers : [DatePipe]
})
export class SharedModule {}
