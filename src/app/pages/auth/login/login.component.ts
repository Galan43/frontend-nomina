import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };
  
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Email y contraseña son requeridos';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.credentials.email)) {
      this.error = 'Por favor ingresa un email válido';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        if (err.code === 'auth/invalid-email') {
          this.error = 'Email inválido';
        } else if (err.code === 'auth/user-not-found') {
          this.error = 'Usuario no encontrado';
        } else if (err.code === 'auth/wrong-password') {
          this.error = 'Contraseña incorrecta';
        } else {
          this.error = 'Error al iniciar sesión. Verifica tus credenciales.';
        }
        this.loading = false;
      }
    });
  }
}
