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
  private codeExpiryInterval: any; // Para limpiar el intervalo
  private resendCooldownInterval: any; // Para el cooldown de reenvío

  // Estados
  currentStep = signal<ForgotPasswordStep>('email');
  isLoading = signal<boolean>(false);
  
  // Paso 1: Email
  email = signal<string>('');
  emailError = signal<string>('');
  
  // Paso 2: Verificación de código
  recoveryCode = signal<string>('');
  codeError = signal<string>('');
  codeExpiry = signal<number>(0); // Tiempo restante en segundos (24h del backend)
  canResendCode = signal<boolean>(true); // Permite o bloquea reenvío
  resendCooldown = signal<number>(0); // Countdown 60s entre reenvíos
  
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
        this.recoveryCode.set('');
        this.codeError.set('');
        this.canResendCode.set(false); // Bloquea reenvío inicial
        this.startCodeExpiry();
        this.startResendCooldown();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error(err?.error?.message || 'Error al enviar el código', 'Error');
      }
    });
  }

  /**
   * Iniciar timer de expiración del código (24 horas desde backend)
   * Mostramos "Válido por 24 horas" estático, sin countdown real
   */
  private startCodeExpiry() {
    // Timer de 24h para referencia (86400 segundos)
    // Pero NO mostramos countdown, solo "Válido por 24 horas"
    let seconds = 86400; // 24 horas
    this.codeExpiry.set(seconds);

    this.codeExpiryInterval = setInterval(() => {
      seconds--;
      this.codeExpiry.set(seconds);

      // Si llega a 0 (muy poco probable en práctica, usuario vería mensaje del backend)
      if (seconds <= 0) {
        clearInterval(this.codeExpiryInterval);
      }
    }, 1000);
  }

  /**
   * Cooldown de 60 segundos para reenvío de código
   */
  private startResendCooldown() {
    let seconds = 60;
    this.resendCooldown.set(seconds);
    this.canResendCode.set(false);

    this.resendCooldownInterval = setInterval(() => {
      seconds--;
      this.resendCooldown.set(seconds);

      if (seconds <= 0) {
        clearInterval(this.resendCooldownInterval);
        this.canResendCode.set(true);
        this.resendCooldown.set(0);
      }
    }, 1000);
  }

  /**
   * Reenviar código (sin cambiar de paso)
   */
  resendCode() {
    this.isLoading.set(true);

    this.authService.requestPasswordReset(this.email()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastr.success('Código reenviado a tu email', 'Éxito');
        this.recoveryCode.set('');
        this.codeError.set('');
        this.startResendCooldown();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error(err?.error?.message || 'Error al reenviar el código', 'Error');
      }
    });
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
        this.cleanupIntervals(); // Limpiar intervals al cambiar de paso
        this.currentStep.set('reset');
      },
      error: (err) => {
        this.isLoading.set(false);
        // Manejo de 3 intentos agotados desde backend
        const message = err?.error?.message || 'Código inválido';
        if (message.includes('intentos') || message.includes('agotado') || message.includes('expirado')) {
          this.codeError.set(message);
          // Dar opción de reenviar o volver
          this.toastr.error(message, 'Código Inválido');
        } else {
          this.codeError.set(message);
        }
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
        this.cleanupIntervals();
        this.toastr.success('Contraseña restablecida exitosamente', 'Éxito');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error(err?.error?.message || 'Error al restablecer la contraseña', 'Error');
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
   * Limpiar todos los intervals
   */
  private cleanupIntervals() {
    if (this.codeExpiryInterval) clearInterval(this.codeExpiryInterval);
    if (this.resendCooldownInterval) clearInterval(this.resendCooldownInterval);
  }

  /**
   * Volver al paso anterior - LIMPIA ESTADO COMPLETAMENTE
   */
  goBack() {
    if (this.currentStep() === 'verify') {
      // Volver a email: limpia TODO del paso 2
      this.cleanupIntervals();
      this.currentStep.set('email');
      this.recoveryCode.set('');
      this.codeError.set('');
      this.codeExpiry.set(0);
      this.canResendCode.set(true);
      this.resendCooldown.set(0);
    } else if (this.currentStep() === 'reset') {
      // Volver a verify: limpia solo contraseña
      this.currentStep.set('verify');
      this.newPassword.set('');
      this.confirmPassword.set('');
      this.passwordError.set('');
      this.secureError.set('');
      this.passwordStrength.set(null);
    }
  }

  /**
   * Ir a login
   */
  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
