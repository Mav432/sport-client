import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

/**
 * Interceptor para agregar token JWT en todas las peticiones HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // Obtener token
  const token = authService.getToken();

  // Clonar request y agregar token si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Manejar errores de autenticación
  return next(authReq).pipe(
    catchError((error) => {
      // Error 401 - No autorizado
      if (error.status === 401) {
        toastr.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'Sesión Expirada');
        authService.logout();
        router.navigate(['/auth/login']);
      }

      // Error 403 - Prohibido (sin permisos)
      if (error.status === 403) {
        toastr.error('No tienes permisos para realizar esta acción', 'Acceso Denegado');
        const user = authService.getCurrentUser();
        if (user) {
          const dashboardRoute = getDashboardRoute(user.rol);
          router.navigate([dashboardRoute]);
        }
      }

      // Error 500 - Error del servidor
      if (error.status === 500) {
        toastr.error('Error en el servidor. Intenta nuevamente más tarde.', 'Error del Servidor');
      }

      return throwError(() => error);
    })
  );
};

// Import helper
import { getDashboardRoute } from '../models/user.model';
