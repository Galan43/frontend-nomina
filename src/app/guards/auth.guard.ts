import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Verificando acceso a:', state.url);
    
    const isAuth = this.authService.isAuthenticated();
    const currentUser = this.authService.getCurrentUser();
    
    console.log('AuthGuard: isAuthenticated =', isAuth);
    console.log('AuthGuard: currentUser =', currentUser);
    
    if (isAuth && currentUser) {
      console.log('AuthGuard: Acceso permitido');
      return true;
    } else {
      console.log('AuthGuard: Acceso denegado, redirigiendo a login');
      // Limpiar cualquier dato corrupto
      this.authService.logout();
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}