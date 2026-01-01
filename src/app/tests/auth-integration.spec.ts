import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

@Component({
  template: '<div>Dashboard</div>'
})
class MockDashboardComponent { }

@Component({
  template: '<div>Login</div>'
})
class MockLoginComponent { }

describe('Authentication Integration Tests', () => {
  let router: Router;
  let location: Location;
  let authService: jasmine.SpyObj<AuthService>;
  let authGuard: AuthGuard;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'login', 'logout']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'login', component: MockLoginComponent },
          { path: 'dashboard', component: MockDashboardComponent, canActivate: [AuthGuard] },
          { path: '', redirectTo: '/login', pathMatch: 'full' }
        ])
      ],
      declarations: [MockDashboardComponent, MockLoginComponent],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authGuard = TestBed.inject(AuthGuard);
  });

  it('should redirect to login when not authenticated', async () => {
    authService.isAuthenticated.and.returnValue(false);
    
    await router.navigate(['/dashboard']);
    
    expect(location.path()).toBe('/login');
  });

  it('should allow access to dashboard when authenticated', async () => {
    authService.isAuthenticated.and.returnValue(true);
    
    await router.navigate(['/dashboard']);
    
    expect(location.path()).toBe('/dashboard');
  });
});