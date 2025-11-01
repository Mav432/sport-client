import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { getDashboardRoute } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  logo = './assets/images/logo_sportcenter.png';
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }

  getDashboardLink(): string {
    const user = this.authService.currentUser();
    if (user) {
      return getDashboardRoute(user.rol);
    }
    return '/home';
  }
}
