import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';

import { UserService } from './user.service';
import { take } from 'rxjs/operators';

import { NavController } from '@ionic/angular';


@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
  constructor(
    private router: Router,
    private userService: UserService,
    public navCtrl: NavController
  ) {

  }

  canActivate(next: ActivatedRouteSnapshot): Observable<boolean> {
      console.log("jlgranda.com >>> canActivate");
    this.userService.isAuthenticated.subscribe(
      (authenticated) => {
        if (authenticated) {
          const rolSelected = this.userService.getRolSelected();
          let acceso = false;
          if (next.data && next.data.roles) {
            acceso = next.data.roles.includes(rolSelected)
          }
          if (next.data.roles && !acceso) {
            //this.router.navigate(['error403']);
            this.navCtrl.navigateRoot('error403');
            return false;
          }
          return this.userService.isAuthenticated.pipe(take(1));
        }
        
        //this.router.navigate(['']); //Ir al inicio 
        this.navCtrl.navigateRoot('');
        return this.userService.isAuthenticated.pipe(take(1));
      }
    );
    
    //this.router.navigate(['']); //Ir al inicio 
    return this.userService.isAuthenticated.pipe(take(1));
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }
}
