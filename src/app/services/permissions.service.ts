import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER', 
  EMPLOYEE = 'EMPLOYEE'
}

export enum Permission {
  // Empleados
  VIEW_EMPLOYEES = 'VIEW_EMPLOYEES',
  CREATE_EMPLOYEE = 'CREATE_EMPLOYEE',
  EDIT_EMPLOYEE = 'EDIT_EMPLOYEE',
  DELETE_EMPLOYEE = 'DELETE_EMPLOYEE',
  
  // Puestos
  VIEW_POSITIONS = 'VIEW_POSITIONS',
  CREATE_POSITION = 'CREATE_POSITION',
  EDIT_POSITION = 'EDIT_POSITION',
  DELETE_POSITION = 'DELETE_POSITION',
  
  // Conceptos
  VIEW_CONCEPTS = 'VIEW_CONCEPTS',
  CREATE_CONCEPT = 'CREATE_CONCEPT',
  EDIT_CONCEPT = 'EDIT_CONCEPT',
  DELETE_CONCEPT = 'DELETE_CONCEPT',
  
  // Reportes
  VIEW_REPORTS = 'VIEW_REPORTS',
  EXPORT_REPORTS = 'EXPORT_REPORTS',
  
  // Dashboard
  VIEW_DASHBOARD = 'VIEW_DASHBOARD'
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  
  private rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
      Permission.VIEW_EMPLOYEES, Permission.CREATE_EMPLOYEE, Permission.EDIT_EMPLOYEE, Permission.DELETE_EMPLOYEE,
      Permission.VIEW_POSITIONS, Permission.CREATE_POSITION, Permission.EDIT_POSITION, Permission.DELETE_POSITION,
      Permission.VIEW_CONCEPTS, Permission.CREATE_CONCEPT, Permission.EDIT_CONCEPT, Permission.DELETE_CONCEPT,
      Permission.VIEW_REPORTS, Permission.EXPORT_REPORTS,
      Permission.VIEW_DASHBOARD
    ],
    [UserRole.MANAGER]: [
      Permission.VIEW_EMPLOYEES, Permission.CREATE_EMPLOYEE, Permission.EDIT_EMPLOYEE,
      Permission.VIEW_POSITIONS, Permission.CREATE_POSITION, Permission.EDIT_POSITION,
      Permission.VIEW_CONCEPTS, Permission.CREATE_CONCEPT, Permission.EDIT_CONCEPT,
      Permission.VIEW_REPORTS, Permission.EXPORT_REPORTS,
      Permission.VIEW_DASHBOARD
    ],
    [UserRole.EMPLOYEE]: [
      Permission.VIEW_EMPLOYEES,
      Permission.VIEW_POSITIONS,
      Permission.VIEW_CONCEPTS,
      Permission.VIEW_REPORTS,
      Permission.VIEW_DASHBOARD
    ]
  };

  constructor(private authService: AuthService) {}

  hasPermission(permission: Permission): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.rol) {
      return false;
    }

    const userRole = currentUser.rol as UserRole;
    const permissions = this.rolePermissions[userRole] || [];
    return permissions.includes(permission);
  }

  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  getUserRole(): UserRole | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.rol as UserRole || null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === UserRole.ADMIN;
  }

  isManager(): boolean {
    return this.getUserRole() === UserRole.MANAGER;
  }

  isEmployee(): boolean {
    return this.getUserRole() === UserRole.EMPLOYEE;
  }
}