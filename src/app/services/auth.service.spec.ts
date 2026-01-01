import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check authentication status', () => {
    // Test when not authenticated
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    expect(service.isAuthenticated()).toBeFalsy();

    // Test when authenticated
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ nombre: 'Test User' }));
    expect(service.isAuthenticated()).toBeTruthy();
  });

  it('should get current user', () => {
    const mockUser = { nombre: 'Test User', email: 'test@test.com' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Reload user from storage
    service['loadUserFromStorage']();
    
    const currentUser = service.getCurrentUser();
    expect(currentUser).toBeTruthy();
    expect(currentUser?.nombre).toBe('Test User');
  });

  it('should logout and clear data', () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ nombre: 'Test' }));
    
    service.logout();
    
    expect(service.getCurrentUser()).toBeNull();
  });
});