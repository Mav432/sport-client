import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { LoginRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  googleAuthService = inject(GoogleAuthService);  // Público para acceder desde template

  credentials: LoginRequest = {
    email: '',
    passw: ''
  };

  showPassword = false;
  rememberMe = false;
  isLoading = false;
  googleClientId = ''; // Se debe configurar desde environment

  ngOnInit() {
    // Inicializar Google Auth si está disponible
    this.initializeGoogle();
  }

  /**
   * Inicializar Google Identity Services
   */
  private initializeGoogle(): void {
    // Cliente ID configurado para Google OAuth
    const googleClientId = '637508139644-n30pocvh0corlgsv79bmu4joagg46nrv.apps.googleusercontent.com';

    if (googleClientId && googleClientId.includes('.apps.googleusercontent.com')) {
      this.googleAuthService.initializeGoogle(googleClientId);
      
      // Renderizar botón de Google con delay para asegurar que DOM esté listo
      setTimeout(() => {
        this.googleAuthService.renderGoogleButton('google-signin-button', {
          theme: 'outline',
          size: 'large',
          text: 'signin_with'
        });
      }, 300);
    } else {
      console.warn('⚠️ Google Client ID no está configurado');
    }
  }

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
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  loginWithFacebook() {
    // TODO: Implementar OAuth con Facebook
    console.log('Facebook login - proximamente');
  }
}