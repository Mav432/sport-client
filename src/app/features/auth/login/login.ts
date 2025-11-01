import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);

  credentials: LoginRequest = {
    email: '',
    passw: ''
  };

  showPassword = false;
  rememberMe = false;
  isLoading = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.credentials.email || !this.credentials.passw) {
      return;
    }

    this.isLoading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        // El AuthService maneja la redirección automáticamente
        this.isLoading = false;
      },
      error: (error) => {
        // El AuthService maneja los errores automáticamente
        this.isLoading = false;
      }
    });
  }

  loginWithGoogle() {
    // TODO: Implementar OAuth con Google
    console.log('Google login - proximamente');
  }

  loginWithFacebook() {
    // TODO: Implementar OAuth con Facebook
    console.log('Facebook login - proximamente');
  }
}