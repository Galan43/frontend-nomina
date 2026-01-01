import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Email Validation', () => {
    it('should validate correct emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'admin@company.org'
      ];

      validEmails.forEach(email => {
        expect(service.isValidEmail(email)).toBeTruthy();
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(service.isValidEmail(email)).toBeFalsy();
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPassword = 'MyStr0ng!Pass';
      const result = service.isValidPassword(strongPassword);
      
      expect(result.valid).toBeTruthy();
      expect(result.errors.length).toBe(0);
    });

    it('should reject weak passwords', () => {
      const weakPassword = '123';
      const result = service.isValidPassword(weakPassword);
      
      expect(result.valid).toBeFalsy();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize malicious input', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = service.sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should remove javascript protocols', () => {
      const maliciousInput = 'javascript:alert("xss")';
      const sanitized = service.sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('javascript:');
    });
  });

  describe('Empleado Validation', () => {
    it('should validate correct empleado data', () => {
      const validEmpleado = {
        nombre: 'Juan Pérez',
        email: 'juan@company.com',
        puesto: 'Desarrollador',
        region: 'Norte',
        rol: 'EMPLOYEE'
      };

      const result = service.validateEmpleado(validEmpleado);
      expect(result.valid).toBeTruthy();
    });

    it('should reject invalid empleado data', () => {
      const invalidEmpleado = {
        nombre: 'A', // Muy corto
        email: 'invalid-email',
        puesto: '',
        region: '',
        rol: 'INVALID_ROLE'
      };

      const result = service.validateEmpleado(invalidEmpleado);
      expect(result.valid).toBeFalsy();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});