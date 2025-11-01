import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthState,
  UserRole,
  getDashboardRoute
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  // API Base URL desde environment
  private readonly API_URL = environment.apiUrl;
  
  // Storage keys desde environment
  private readonly TOKEN_KEY = environment.storageKeys.token;
  private readonly USER_KEY = environment.storageKeys.user;

  // Auth State usando BehaviorSubject para reactividad
  private authState$ = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  // Signals para estado reactivo (Angular 18+)
  public currentUser = signal<User | null>(null);
  public isAuthenticated = signal<boolean>(false);

  constructor() {
    this.loadAuthState();
  }

  /**
   * Cargar estado de autenticación desde localStorage
   */
  private loadAuthState(): void {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);

      if (token && userStr) {
        // Verificar si el token está expirado
        if (this.isTokenExpired(token)) {
          console.warn('Token expirado, limpiando sesión');
          this.clearAuthState();
          return;
        }

        const user = JSON.parse(userStr);
        this.updateAuthState(true, user, token);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      this.clearAuthState();
    }
  }

  /**
   * Verificar si el token JWT está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded.exp) return false;

      const expirationDate = new Date(decoded.exp * 1000);
      const now = new Date();
      
      return expirationDate < now;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Si hay error, considerar como expirado
    }
  }

  /**
   * Actualizar estado de autenticación
   */
  private updateAuthState(isAuth: boolean, user: User | null, token: string | null): void {
    this.authState$.next({
      isAuthenticated: isAuth,
      user,
      token
    });
    this.currentUser.set(user);
    this.isAuthenticated.set(isAuth);
  }

  /**
   * Guardar datos de autenticación
   */
  private saveAuthData(token: string, user: User): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      
      // También guardar timestamp para debugging
      localStorage.setItem('auth_timestamp', new Date().toISOString());
      
      this.updateAuthState(true, user, token);
      
      console.log('✅ Sesión guardada correctamente');
    } catch (error) {
      console.error('❌ Error guardando sesión:', error);
      this.toastr.error('Error al guardar la sesión', 'Error');
    }
  }

  /**
   * Limpiar estado de autenticación
   */
  private clearAuthState(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('auth_timestamp');
    this.updateAuthState(false, null, null);
    
    console.log('🔐 Sesión limpiada');
  }

  /**
   * LOGIN - Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/users/login-user`,
      credentials
    ).pipe(
      tap(response => {
        // El backend solo devuelve { "token": "..." }
        if (response && response.token) {
          // Decodificar el token JWT para obtener los datos del usuario
          const tokenData = this.decodeToken(response.token);
          
          // Crear objeto User a partir de los datos del token
          const user: User = {
            id: tokenData.id,
            nombre: tokenData.nombre || '',
            aPaterno: tokenData.aPaterno || '',
            aMaterno: tokenData.aMaterno || '',
            email: tokenData.email,
            telefono: tokenData.telefono || '',
            rol: tokenData.rol,
            activo: 1 // Asumimos activo si logró hacer login
          };
          
          this.saveAuthData(response.token, user);
          this.toastr.success(`¡Bienvenido!`, 'Login Exitoso');
          
          // Redireccionar según rol
          const dashboardRoute = getDashboardRoute(user.rol);
          this.router.navigate([dashboardRoute]);
        } else {
          this.toastr.error('Respuesta inválida del servidor', 'Error');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        const message = error.error?.message || error.error?.error || 'Error al iniciar sesión. Verifica tus credenciales.';
        this.toastr.error(message, 'Error de Autenticación');
        return throwError(() => error);
      })
    );
  }

  /**
   * Decodificar JWT token (simple, sin validación)
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return {};
    }
  }

  /**
   * REGISTER - Registrar nuevo usuario
   */
  register(userData: RegisterRequest): Observable<any> {
    // Asegurar que el rol sea 1 para registros públicos
    const registerData = {
      ...userData,
      rol: UserRole.USUARIO,
      activo: 1 // Activo por defecto
    };

    return this.http.post<any>(
      `${this.API_URL}/users/create-user`,
      registerData
    ).pipe(
      tap(response => {
        // El backend devuelve el objeto usuario completo
        if (response && response.id_usuario) {
          this.toastr.success(
            'Tu cuenta ha sido creada exitosamente.',
            'Registro Exitoso'
          );
          // Redireccionar a login después de registro
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.toastr.error('Error en el registro', 'Error');
        }
      }),
      catchError(error => {
        console.error('Register error:', error);
        const message = error.error?.message || error.error?.error || 'Error al registrar usuario. El email podría estar en uso.';
        this.toastr.error(message, 'Error de Registro');
        return throwError(() => error);
      })
    );
  }

  /**
   * LOGOUT - Cerrar sesión
   */
  logout(): void {
    const user = this.currentUser();
    this.clearAuthState();
    this.toastr.success('Sesión cerrada correctamente', 'Hasta pronto');
    this.router.navigate(['/home']);
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    const user = this.currentUser();
    return user !== null && user.rol === role;
  }

  /**
   * Verificar si el usuario tiene al menos uno de los roles especificados
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    return user !== null && roles.includes(user.rol);
  }

  /**
   * Obtener observable del estado de autenticación
   */
  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  /**
   * Verificar si el usuario está activo
   */
  isUserActive(): boolean {
    const user = this.currentUser();
    return user !== null && user.activo === 1;
  }

  /**
   * Actualizar información del usuario actual
   */
  updateCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }
}
