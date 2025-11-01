// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-register',
//   imports: [],
//   templateUrl: './register.html',
//   styleUrl: './register.css',
// })
// export class Register {

// }

import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest, UserRole } from '../../../core/models/user.model';

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
    activo: 0
  };

  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;
  subscribeNewsletter = false;
  isLoading = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

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

  validateForm(): boolean {
    if (this.userData.passw !== this.confirmPassword) {
      return false;
    }

    if (this.userData.passw.length < 6) {
      return false;
    }

    if (!this.acceptTerms) {
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
