import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  // Validación de email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validación de contraseña segura
  isValidPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Sanitización de entrada
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover eventos onclick, onload, etc.
      .trim();
  }

  // Validación de números
  isValidNumber(value: any, min?: number, max?: number): boolean {
    const num = parseFloat(value);
    
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    
    return true;
  }

  // Validación de texto
  isValidText(text: string, minLength: number = 1, maxLength: number = 255): boolean {
    if (!text || typeof text !== 'string') return false;
    
    const sanitized = this.sanitizeInput(text);
    return sanitized.length >= minLength && sanitized.length <= maxLength;
  }

  // Validación de región
  isValidRegion(region: string): boolean {
    const validRegions = ['NORTE', 'SUR', 'ESTE', 'OESTE', 'CENTRO'];
    return validRegions.includes(region.toUpperCase());
  }

  // Validación de rol
  isValidRole(role: string): boolean {
    const validRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
    return validRoles.includes(role.toUpperCase());
  }

  // Validación de empleado
  validateEmpleado(empleado: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.isValidText(empleado.nombre, 2, 100)) {
      errors.push('Nombre debe tener entre 2 y 100 caracteres');
    }

    if (empleado.email && !this.isValidEmail(empleado.email)) {
      errors.push('Email no válido');
    }

    if (!this.isValidText(empleado.puesto, 2, 100)) {
      errors.push('Puesto debe tener entre 2 y 100 caracteres');
    }

    if (!this.isValidText(empleado.region, 2, 50)) {
      errors.push('Región debe tener entre 2 y 50 caracteres');
    }

    if (empleado.rol && !this.isValidRole(empleado.rol)) {
      errors.push('Rol no válido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validación de concepto de nómina
  validateConcepto(concepto: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.isValidText(concepto.nombre, 2, 100)) {
      errors.push('Nombre debe tener entre 2 y 100 caracteres');
    }

    if (!['PERCEPCION', 'DEDUCCION'].includes(concepto.tipo)) {
      errors.push('Tipo debe ser PERCEPCION o DEDUCCION');
    }

    if (!this.isValidNumber(concepto.importe, 0, 999999)) {
      errors.push('Importe debe ser un número entre 0 y 999,999');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}