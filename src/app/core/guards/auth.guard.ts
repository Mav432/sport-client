import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Guard para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (authService.isLoggedIn()) {
    // Verificar si el usuario está activo
    if (!authService.isUserActive()) {
      toastr.warning('Tu cuenta está pendiente de activación', 'Cuenta Inactiva');
      authService.logout();
      return false;
    }
    return true;
  }

  toastr.warning('Debes iniciar sesión para acceder a esta página', 'Acceso Denegado');
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

/**
 * Guard para redirigir usuarios autenticados fuera de páginas de auth
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Si ya está autenticado, redirigir a su dashboard
  const user = authService.getCurrentUser();
  if (user) {
    const dashboardRoute = getDashboardRoute(user.rol);
    router.navigate([dashboardRoute]);
  }
  return false;
};

// Import helper
import { getDashboardRoute } from '../models/user.model';
