import { Component, OnInit } from '@angular/core';
import { User, UserService } from 'src/app/core';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
    //Autenticación
    currentUser: User;
    constructor(
        public userService: UserService,
    ) { }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(userData => {
            this.currentUser = userData;
        });
    }

}
