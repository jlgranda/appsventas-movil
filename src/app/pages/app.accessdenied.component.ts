import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-accessdenied',
  templateUrl: './app.accessdenied.component.html',
})
export class AppAccessdeniedComponent implements OnInit {

    app: AppComponent;


    constructor(
        private appController: AppComponent,
    ) {
        this.app = appController;
    }
    
    ngOnInit() {
    }

}
