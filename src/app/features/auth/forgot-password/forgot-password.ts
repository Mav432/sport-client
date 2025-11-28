import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { validateEmail, evaluatePasswordStrength, validatePasswordComplexity, isSecureInput, PasswordStrength } from '../../../core/validators/custom-validators';
import { PasswordStrengthComponent } from '../../../shared/components/password-strength/password-strength.component';

type ForgotPasswordStep = 'email' | 'verify' | 'reset';

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PasswordStrengthComponent],
  templateUrl: "./forgot-password.html",
  styleUrl: "./forgot-password.css"
})
export class ForgotPassword {
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // Estados
  currentStep = signal<ForgotPasswordStep>('email');
  isLoading = signal<boolean>(false);
  
  // Paso 1: Email
  email = signal<string>('');
  emailError = signal<string>('');
  
  // Paso 2: Verificación de código
  recoveryCode = signal<string>('');
  codeError = signal<string>('');
  codeExpiry = signal<number>(0); // Tiempo restante en segundos
  
  // Paso 3: Nueva contraseña
  newPassword = signal<string>('');
  confirmPassword = signal<string>('');
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  passwordError = signal<string>('');
  secureError = signal<string>('');
  passwordStrength = signal<PasswordStrength | null>(null);

  /**
   * Paso 1: Solicitar código de recuperación
   */
  requestRecoveryCode() {
    this.emailError.set('');

    if (!this.email() || !validateEmail(this.email())) {
      this.emailError.set('Por favor ingresa un email válido');
      return;
    }

    this.isLoading.set(true);

    this.authService.requestPasswordReset(this.email()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.currentStep.set('verify');
        this.startCodeExpiry();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Iniciar timer de expiración del código (5 minutos)
   */
  private startCodeExpiry() {
    let seconds = 300; // 5 minutos
    this.codeExpiry.set(seconds);

    const interval = setInterval(() => {
      seconds--;
      this.codeExpiry.set(seconds);

      if (seconds <= 0) {
        clearInterval(interval);
        this.toastr.error('El código ha expirado. Solicita uno nuevo', 'Código Expirado');
        this.currentStep.set('email');
        this.recoveryCode.set('');
      }
    }, 1000);
  }

  /**
   * Paso 2: Verificar código
   */
  verifyCode() {
    this.codeError.set('');

    if (!this.recoveryCode() || this.recoveryCode().length < 1) {
      this.codeError.set('Ingresa el código que recibiste');
      return;
    }

    this.isLoading.set(true);

    this.authService.verifyRecoveryCode(this.email(), this.recoveryCode()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.currentStep.set('reset');
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Paso 3: Restablecer contraseña
   */
  resetPassword() {
    this.passwordError.set('');
    this.secureError.set('');

    // Validar contraseña
    if (!this.newPassword() || !validatePasswordComplexity(this.newPassword())) {
      this.passwordError.set('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    // Validar entrada segura
    if (!isSecureInput(this.newPassword())) {
      this.secureError.set('La contraseña contiene caracteres no permitidos');
      return;
    }

    // Validar coincidencia
    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('Las contraseñas no coinciden');
      return;
    }

    this.isLoading.set(true);

    this.authService.resetPassword(this.email(), this.newPassword()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Validar contraseña en tiempo real
   */
  onPasswordChange(password: string) {
    this.newPassword.set(password);

    const strength = evaluatePasswordStrength(password);
    this.passwordStrength.set(strength);

    if (password && !validatePasswordComplexity(password)) {
      this.passwordError.set('La contraseña no cumple con los requisitos de seguridad');
    } else {
      this.passwordError.set('');
    }

    if (password && !isSecureInput(password)) {
      this.secureError.set('La contraseña contiene caracteres no permitidos');
    } else {
      this.secureError.set('');
    }
  }

  /**
   * Formatear tiempo restante (MM:SS)
   */
  formatTimeRemaining(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Volver al inicio
   */
  goBack() {
    if (this.currentStep() === 'verify') {
      this.currentStep.set('email');
      this.recoveryCode.set('');
    } else if (this.currentStep() === 'reset') {
      this.currentStep.set('verify');
      this.newPassword.set('');
      this.confirmPassword.set('');
    }
  }

  /**
   * Ir a login
   */
  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
