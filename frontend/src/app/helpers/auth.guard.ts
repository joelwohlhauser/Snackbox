import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuardUser implements CanActivate {
  constructor(
    private router: Router,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (sessionStorage.getItem('username')) {
      if (sessionStorage.getItem('isAdmin') == "true") {
        this.router.navigate(['/admin/dashboard']);
        return false;
      }
      return true;
    } else {
      return false
    }
  }
}


@Injectable({ providedIn: 'root' })
export class AuthGuardAdmin implements CanActivate {
  constructor(
    private router: Router,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (sessionStorage.getItem('username')) {
      if (sessionStorage.getItem('isAdmin') != "true") {
        this.router.navigate(['/user/dashboard']);
        return false;
      }
      return true;
    } else {
      return false
    }
  }
}