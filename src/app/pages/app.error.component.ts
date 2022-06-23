import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
    selector: 'app-error',
    templateUrl: './app.error.component.html',
    styleUrls: ['./app.error.component.scss']
})
export class AppErrorComponent implements OnInit {

    app: AppComponent;


    constructor(
        private appController: AppComponent,
    ) {
        this.app = appController;
    }
    
    ngOnInit() {
    }

}
