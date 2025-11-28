import { Component, inject, signal } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest, UserRole } from '../../../core/models/user.model';
import { 
  evaluatePasswordStrength,
  PasswordStrength,
  validateEmail,
  validatePasswordComplexity,
  validateName,
  isSecureInput
} from '../../../core/validators/custom-validators';
import { PasswordStrengthComponent } from '../../../shared/components/password-strength/password-strength.component';

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    RouterModule,
    PasswordStrengthComponent
  ],
  templateUrl: "./register.html",
  styleUrl: "./register.css"
})
export class Register {
  private authService = inject(AuthService);

  userData: RegisterRequest = {
    nombre: '',
    aPaterno: '',
    aMaterno: '',
    email: '',
    telefono: '',
    passw: '',
    rol: UserRole.USUARIO,
    activo: 1
  };

  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;
  subscribeNewsletter = false;
  isLoading = false;

  // Signals para validación en tiempo real
  passwordStrength = signal<PasswordStrength | null>(null);
  emailError = signal<string>('');
  nameError = signal<string>('');
  passwordError = signal<string>('');
  secureError = signal<string>('');

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Validar email en tiempo real
   */
  onEmailChange(email: string) {
    this.userData.email = email.trim();
    if (!this.userData.email) {
      this.emailError.set('');
      return;
    }
    if (!validateEmail(this.userData.email)) {
      this.emailError.set('El email debe ser válido (ej: usuario@dominio.com)');
    } else {
      this.emailError.set('');
    }
  }

  /**
   * Validar nombre en tiempo real
   */
  onNameChange(field: 'nombre' | 'aPaterno' | 'aMaterno', value: string) {
    const trimmedValue = (value || '').trim();
    this.userData[field] = trimmedValue;
    
    if (!trimmedValue) {
      this.nameError.set('');
      return;
    }
    
    if (!validateName(trimmedValue)) {
      this.nameError.set('El nombre debe tener 2-50 caracteres (solo letras, espacios, guiones y acentos)');
    } else {
      this.nameError.set('');
    }
  }

  /**
   * Validar contraseña en tiempo real
   */
  onPasswordChange(password: string) {
    this.userData.passw = password;
    
    if (!password) {
      this.passwordStrength.set(null);
      this.passwordError.set('');
      this.secureError.set('');
      return;
    }

    // Evaluar fortaleza
    const strength = evaluatePasswordStrength(password);
    this.passwordStrength.set(strength);

    // Validar complejidad
    if (!validatePasswordComplexity(password)) {
      this.passwordError.set('La contraseña no cumple con los requisitos de seguridad');
    } else {
      this.passwordError.set('');
    }

    // Validar que no contenga XSS/SQL
    if (!isSecureInput(password)) {
      this.secureError.set('La contraseña contiene caracteres no permitidos');
    } else {
      this.secureError.set('');
    }
  }

  /**
   * Validar coincidencia de contraseñas
   */
  onConfirmPasswordChange(confirmPassword: string) {
    this.confirmPassword = confirmPassword;
  }

  /**
   * Verificar si contraseñas coinciden
   */
  passwordsMatch(): boolean {
    return this.userData.passw === this.confirmPassword && this.userData.passw.length > 0;
  }

  /**
   * Validar formulario completo
   */
  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Validación del formulario
   */
  validateForm(): boolean {
    // Limpiar errores previos
    this.nameError.set('');
    this.emailError.set('');
    this.passwordError.set('');
    this.secureError.set('');

    // Validar nombre
    if (!this.userData.nombre || this.userData.nombre.trim().length === 0) {
      this.nameError.set('El nombre es requerido');
      return false;
    }
    if (!validateName(this.userData.nombre)) {
      this.nameError.set('El nombre debe tener 2-50 caracteres (solo letras, espacios y acentos)');
      return false;
    }

    // Validar apellido paterno
    if (!this.userData.aPaterno || this.userData.aPaterno.trim().length === 0) {
      this.nameError.set('El apellido paterno es requerido');
      return false;
    }
    if (!validateName(this.userData.aPaterno)) {
      this.nameError.set('El apellido paterno debe tener 2-50 caracteres');
      return false;
    }

    // Validar email
    if (!this.userData.email || this.userData.email.trim().length === 0) {
      this.emailError.set('El email es requerido');
      return false;
    }
    if (!validateEmail(this.userData.email)) {
      this.emailError.set('El email debe ser válido (ej: usuario@dominio.com)');
      return false;
    }

    // Validar teléfono
    if (!this.userData.telefono || this.userData.telefono.trim().length === 0) {
      this.nameError.set('El teléfono es requerido');
      return false;
    }

    // Validar contraseña
    if (!this.userData.passw || this.userData.passw.length === 0) {
      this.passwordError.set('La contraseña es requerida');
      return false;
    }
    if (!validatePasswordComplexity(this.userData.passw)) {
      this.passwordError.set('La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial');
      return false;
    }

    // Validar entrada segura
    if (!isSecureInput(this.userData.passw)) {
      this.secureError.set('La contraseña contiene caracteres no permitidos (XSS/SQL)');
      return false;
    }

    // Validar coincidencia
    if (!this.passwordsMatch()) {
      this.passwordError.set('Las contraseñas no coinciden');
      return false;
    }

    // Validar términos
    if (!this.acceptTerms) {
      this.nameError.set('Debes aceptar los términos y condiciones');
      return false;
    }

    return true;
  }

  registerWithGoogle() {
    console.log('Google register - proximamente');
  }

  registerWithFacebook() {
    console.log('Facebook register - proximamente');
  }
}
