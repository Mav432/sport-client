import { Component, inject, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { getDashboardRoute } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  logo = './assets/images/logo_sportcenter.png';
  
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private router = inject(Router);

  // Estado de búsqueda
  searchTerm = signal<string>('');
  // Estado del menú móvil
  mobileMenuOpen = signal<boolean>(false);

  // Exponer servicios para el template
  get authServicePublic() { return this.authService; }
  cartItemCount = this.cartService.itemCount;

  onSearch() {
    const term = this.searchTerm().trim();
    if (term) {
      // Navegar a productos con término de búsqueda
      this.router.navigate(['/products'], { 
        queryParams: { search: term }
      });
    } else {
      // Si no hay término, solo navegar a productos
      this.router.navigate(['/products']);
    }
  }

  onSearchKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  logout() {
    this.authService.logout();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  getDashboardLink(): string {
    const user = this.authService.currentUser();
    if (user) {
      return getDashboardRoute(user.rol);
    }
    return '/home';
  }
}
