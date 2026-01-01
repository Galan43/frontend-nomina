import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EncryptionService } from '../services/encryption.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private encryptionService: EncryptionService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verificar autenticación básica
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar integridad del token
    if (!this.validateTokenIntegrity()) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar permisos de ruta
    if (!this.checkRoutePermissions(route)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Verificar sesión activa
    if (!this.validateActiveSession()) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }

  private validateTokenIntegrity(): boolean {
    try {
      const token = this.authService.getToken();
      if (!token) return false;

      // Verificar formato JWT
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Verificar payload
      const payload = JSON.parse(atob(parts[1]));
      
      // Verificar expiración
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  private checkRoutePermissions(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    const requiredRole = route.data?.['role'];
    if (!requiredRole) return true;

    const userRole = user.rol || 'EMPLOYEE';
    const roleHierarchy = ['EMPLOYEE', 'MANAGER', 'ADMIN'];
    
    const userLevel = roleHierarchy.indexOf(userRole);
    const requiredLevel = roleHierarchy.indexOf(requiredRole);

    return userLevel >= requiredLevel;
  }

  private validateActiveSession(): boolean {
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return true;

    const now = Date.now();
    const lastActivityTime = parseInt(lastActivity);
    const sessionTimeout = 30 * 60 * 1000; // 30 minutos

    if (now - lastActivityTime > sessionTimeout) {
      return false;
    }

    // Actualizar última actividad
    localStorage.setItem('lastActivity', now.toString());
    return true;
  }
}