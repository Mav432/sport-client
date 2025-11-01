// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-dashboard',
//   imports: [],
//   templateUrl: './dashboard.html',
//   styleUrl: './dashboard.css',
// })
// export class Dashboard {

// }
import { Component, inject, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, Router } from "@angular/router"
import { ToastrService } from "ngx-toastr"

interface Order {
  id: number
  date: string
  total: number
  status: 'processing' | 'shipped' | 'completed'
  items: number
}

interface WishlistItem {
  id: number
  name: string
  price: number
  image: string
}

interface Notification {
  id: number
  title: string
  message: string
  icon: string
  time: string
  read: boolean
}

interface Stats {
  totalOrders: number
  pendingOrders: number
  totalSpent: number
  loyaltyPoints: number
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./dashboard.html",
})
export class Dashboard {
  private toastr = inject(ToastrService)
  private router = inject(Router)

  showUserMenu = false
  showNotifications = false
  unreadNotifications = 3

  stats: Stats = {
    totalOrders: 12,
    pendingOrders: 2,
    totalSpent: 856.50,
    loyaltyPoints: 350
  }

  recentOrders: Order[] = [
    {
      id: 12345,
      date: '15 Nov 2024',
      total: 159.96,
      status: 'completed',
      items: 3
    },
    {
      id: 12344,
      date: '12 Nov 2024',
      total: 89.99,
      status: 'shipped',
      items: 1
    },
    {
      id: 12343,
      date: '8 Nov 2024',
      total: 234.50,
      status: 'processing',
      items: 4
    }
  ]

  wishlistItems: WishlistItem[] = [
    {
      id: 6,
      name: 'Raqueta Tenis Pro',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 7,
      name: 'Mochila Deportiva',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
    }
  ]

  notifications: Notification[] = [
    {
      id: 1,
      title: '¡Pedido enviado!',
      message: 'Tu pedido #12344 ha sido enviado',
      icon: 'local_shipping',
      time: 'Hace 2 horas',
      read: false
    },
    {
      id: 2,
      title: 'Oferta especial',
      message: '20% de descuento en running',
      icon: 'local_offer',
      time: 'Hace 1 día',
      read: false
    },
    {
      id: 3,
      title: 'Puntos ganados',
      message: 'Has ganado 50 puntos de fidelidad',
      icon: 'loyalty',
      time: 'Hace 2 días',
      read: false
    },
    {
      id: 4,
      title: 'Pedido completado',
      message: 'Tu pedido #12345 ha sido entregado',
      icon: 'check_circle',
      time: 'Hace 3 días',
      read: true
    }
  ]

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.user-menu') && !target.closest('.notifications-menu')) {
      this.showUserMenu = false
      this.showNotifications = false
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu
    this.showNotifications = false
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications
    this.showUserMenu = false
  }

  markAllAsRead() {
    this.notifications.forEach(notification => notification.read = true)
    this.unreadNotifications = 0
    this.toastr.success('Todas las notificaciones marcadas como leídas', 'Listo')
  }

  logout() {
    this.toastr.info('Cerrando sesión...', 'Adiós')
    this.router.navigate(['/home'])
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'processing': 'En proceso',
      'shipped': 'Enviado',
      'completed': 'Completado'
    }
    return statusMap[status] || status
  }

  viewOrder(orderId: number) {
    this.toastr.info(`Viendo detalles del pedido #${orderId}`, 'Detalles del Pedido')
    this.router.navigate(['/orders', orderId])
  }

  startReturn() {
    this.toastr.info('Iniciando proceso de devolución...', 'Devolución')
  }

  contactSupport() {
    this.toastr.info('Conectando con soporte...', 'Soporte')
  }

  editProfile() {
    this.router.navigate(['/profile'])
  }

  moveToCart(item: WishlistItem) {
    this.toastr.success(`${item.name} movido al carrito`, '¡Agregado!')
    this.wishlistItems = this.wishlistItems.filter(i => i.id !== item.id)
  }
}