import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { UserService } from '../core';
import { take } from 'rxjs/operators';

@Injectable()
export class InicioAuthResolver implements Resolve<boolean> {
  constructor(
    private router: Router,
    public userService: UserService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
      

    return this.userService.isAuthenticated.pipe(take(1));
  }
}
