import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  constructor(private _router: Router) { }

  canActivate(): boolean {

    const token = localStorage.getItem('userToken')
    if (token) {
      const isExpired = this.isTokenexpired(token)
      if (isExpired) {
        this.logout()
        return false
      }
      console.log("not expired")
      return true;
    }
    else {
      this._router.navigate(['/login'])
      return false
    }



  }


  isTokenexpired(token: string): boolean {
    const decodedToken = this.decodeToken(token)
    if (!decodedToken) {
      return true
    }

    const expiry = decodedToken.exp * 1000;
    return Date.now() > expiry
  }


  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }


  logout(): void {

    localStorage.removeItem('userToken')
    this._router.navigate(['/login'])

  }

}



