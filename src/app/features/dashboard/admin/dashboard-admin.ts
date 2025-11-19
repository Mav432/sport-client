import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { User, UserRole } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdmin implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private productService = inject(ProductService);
  
  currentUser: User | null = null;
  private readonly API_URL = environment.apiUrl;

  // Estadísticas del sistema
  stats = {
    totalUsuarios: 145,
    usuariosActivos: 128,
    empleados: 12,
    administradores: 3
  };

  // Lista de usuarios
  usuarios: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  selectedRole: string = 'all';

  // Modal de usuario
  showUserModal = false;
  isEditMode = false;
  selectedUser: User | null = null;
  
  userForm = {
    nombre: '',
    aPaterno: '',
    aMaterno: '',
    email: '',
    telefono: '',
    passw: '',
    rol: UserRole.USUARIO,
    activo: 1
  };

  // Enum para template
  UserRole = UserRole;

  // Gestión de productos
  productos: Product[] = [];
  showProductModal = false;
  isEditProductMode = false;
  selectedProduct: Product | null = null;

  productForm: Partial<Product> = {
    nombre: '',
    categoria: 'todos',
    marca: '',
    descripcion: '',
    disponible: true,
    stock: 0,
    precio: 0
  };

  ngOnInit() {
    this.currentUser = this.authService.currentUser();
    this.loadUsers();
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.productos = products;
      },
      error: (err) => {
        console.error('Error cargando productos en admin:', err);
      }
    });
  }

  loadUsers() {
    // Simulación de datos - Reemplazar con llamada real a API
    this.usuarios = [
      {
        id: 1,
        nombre: 'Juan',
        aPaterno: 'Pérez',
        aMaterno: 'García',
        email: 'juan.perez@email.com',
        telefono: '5551234567',
        rol: UserRole.USUARIO,
        activo: 1
      },
      {
        id: 2,
        nombre: 'María',
        aPaterno: 'González',
        aMaterno: 'López',
        email: 'maria.gonzalez@email.com',
        telefono: '5559876543',
        rol: UserRole.EMPLEADO,
        activo: 1
      },
      {
        id: 3,
        nombre: 'Carlos',
        aPaterno: 'Ruiz',
        aMaterno: 'Martínez',
        email: 'carlos.ruiz@email.com',
        telefono: '5556543210',
        rol: UserRole.ADMIN,
        activo: 1
      }
    ];
    this.filteredUsers = [...this.usuarios];
  }

  filterUsers() {
    let filtered = [...this.usuarios];

    // Filtro por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.nombre.toLowerCase().includes(term) ||
        user.aPaterno.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    // Filtro por rol
    if (this.selectedRole !== 'all') {
      const roleNumber = parseInt(this.selectedRole);
      filtered = filtered.filter(user => user.rol === roleNumber);
    }

    this.filteredUsers = filtered;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.selectedUser = null;
    this.resetForm();
    this.showUserModal = true;
  }

  openEditModal(user: User) {
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm = {
      nombre: user.nombre,
      aPaterno: user.aPaterno,
      aMaterno: user.aMaterno,
      email: user.email,
      telefono: user.telefono,
      passw: '',
      rol: user.rol,
      activo: user.activo
    };
    this.showUserModal = true;
  }

  /* Productos: Modal */
  openCreateProductModal() {
    this.isEditProductMode = false;
    this.selectedProduct = null;
    this.resetProductForm();
    this.showProductModal = true;
  }

  openEditProductModal(product: Product) {
    this.isEditProductMode = true;
    this.selectedProduct = product;
    this.productForm = { ...product };
    this.showProductModal = true;
  }

  closeProductModal() {
    this.showProductModal = false;
    this.resetProductForm();
  }

  resetProductForm() {
    this.productForm = {
      nombre: '',
      categoria: 'otros',
      marca: '',
      descripcion: '',
      disponible: true,
      stock: 0,
      precio: 0
    };
  }

  saveProduct() {
    if (this.isEditProductMode && this.selectedProduct) {
      // Editar en mock
      Object.assign(this.selectedProduct, this.productForm);
      this.loadProducts();
      this.closeProductModal();
    } else {
      // Crear nuevo producto via ProductService (mock)
      this.productService.addProduct(this.productForm).subscribe({
        next: (p) => {
          this.productos.push(p);
          this.closeProductModal();
        },
        error: (err) => {
          console.error('Error creando producto:', err);
        }
      });
    }
  }

  deleteProduct(product: Product) {
    if (!confirm(`¿Eliminar producto ${product.nombre}?`)) return;
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== product.id);
      },
      error: (err) => {
        console.error('Error eliminando producto:', err);
      }
    });
  }

  closeModal() {
    this.showUserModal = false;
    this.resetForm();
  }

  resetForm() {
    this.userForm = {
      nombre: '',
      aPaterno: '',
      aMaterno: '',
      email: '',
      telefono: '',
      passw: '',
      rol: UserRole.USUARIO,
      activo: 1
    };
  }

  saveUser() {
    if (this.isEditMode) {
      // Actualizar usuario existente
      console.log('Actualizando usuario:', this.userForm);
      // TODO: Implementar llamada a API
    } else {
      // Crear nuevo usuario
      console.log('Creando usuario:', this.userForm);
      this.http.post(`${this.API_URL}/create-user`, this.userForm).subscribe({
        next: (response) => {
          console.log('Usuario creado exitosamente:', response);
          this.loadUsers();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
        }
      });
    }
  }

  toggleUserStatus(user: User) {
    user.activo = user.activo === 1 ? 0 : 1;
    console.log('Toggle status:', user);
    // TODO: Implementar llamada a API para actualizar estado
  }

  deleteUser(user: User) {
    if (confirm(`¿Estás seguro de eliminar al usuario ${user.nombre} ${user.aPaterno}?`)) {
      console.log('Eliminando usuario:', user);
      // TODO: Implementar llamada a API para eliminar
    }
  }

  getRoleName(rol: number): string {
    switch (rol) {
      case UserRole.USUARIO:
        return 'Usuario';
      case UserRole.EMPLEADO:
        return 'Empleado';
      case UserRole.ADMIN:
        return 'Administrador';
      default:
        return 'Desconocido';
    }
  }

  getRolClass(rol: number): string {
    switch (rol) {
      case UserRole.USUARIO:
        return 'bg-blue-100 text-blue-800';
      case UserRole.EMPLEADO:
        return 'bg-green-100 text-green-800';
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
