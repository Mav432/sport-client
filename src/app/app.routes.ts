import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { adminGuard, empleadoGuard, usuarioGuard } from './core/guards/role.guard';

export const routes: Routes = [
      {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./shared/components/home/home').then(m => m.Home)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list').then(m => m.ProductList)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/products/product-detail/product-detail').then(m => m.ProductDetail)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart').then(m => m.Cart)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/products/checkout/checkout').then(m => m.Checkout),
    canActivate: [authGuard]
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/email-verification',
    loadComponent: () => import('./features/auth/email-verification/email-verification').then(m => m.EmailVerificationComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/usuario',
    loadComponent: () => import('./features/dashboard/usuario/dashboard-usuario').then(m => m.DashboardUsuario),
    canActivate: [authGuard, usuarioGuard]
  },
  {
    path: 'dashboard/empleado',
    loadComponent: () => import('./features/dashboard/empleado/dashboard-empleado').then(m => m.DashboardEmpleado),
    canActivate: [authGuard, empleadoGuard]
  },
  {
    path: 'dashboard/admin',
    loadComponent: () => import('./features/dashboard/admin/dashboard-admin').then(m => m.DashboardAdmin),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'ofertas',
    loadComponent: () => import('./features/offers/offers').then(m => m.Offers)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];

