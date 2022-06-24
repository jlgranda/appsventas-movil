import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-notfound',
  templateUrl: './app.notfound.component.html',
})
export class AppNotfoundComponent implements OnInit {

    app: AppComponent;


    constructor(
        private appController: AppComponent,
    ) {
        this.app = appController;
    }
    
    ngOnInit() {
    }

}
