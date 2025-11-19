import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { ToastrService } from 'ngx-toastr';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, Breadcrumbs],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastr = inject(ToastrService);

  product = signal<Product | null>(null);
  isLoading = signal<boolean>(true);
  selectedQuantity = signal<number>(1);
  selectedSize = signal<string>('');
  selectedColor = signal<string>('');
  mainImageIndex = signal<number>(0);

  // Breadcrumbs dinámicos
  breadcrumbs = computed((): BreadcrumbItem[] => {
    const product = this.product();
    if (!product) return [
      { label: 'Productos', url: '/products', icon: 'storefront' }
    ];

    return [
      { label: 'Productos', url: '/products', icon: 'storefront' },
      { label: product.categoria.charAt(0).toUpperCase() + product.categoria.slice(1), url: `/products?category=${product.categoria}` },
      { label: product.nombre }
    ];
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  private loadProduct(id: number) {
    this.isLoading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.product.set(product);
          // Seleccionar primera talla y color por defecto
          if (product.talla && product.talla.length > 0) {
            this.selectedSize.set(product.talla[0]);
          }
          if (product.color && product.color.length > 0) {
            this.selectedColor.set(product.color[0]);
          }
        } else {
          this.toastr.error('Producto no encontrado', 'Error');
          this.router.navigate(['/products']);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Error al cargar el producto', 'Error');
        this.router.navigate(['/products']);
        this.isLoading.set(false);
      }
    });
  }

  addToCart() {
    const product = this.product();
    if (!product) return;

    if (!product.disponible || product.stock === 0) {
      this.toastr.error('Este producto no está disponible', 'No disponible');
      return;
    }

    if (this.selectedQuantity() > product.stock) {
      this.toastr.error(`Solo hay ${product.stock} unidades disponibles`, 'Stock insuficiente');
      return;
    }

    // Validar selecciones requeridas
    if (product.talla && product.talla.length > 0 && !this.selectedSize()) {
      this.toastr.error('Por favor selecciona una talla', 'Selección requerida');
      return;
    }

    if (product.color && product.color.length > 0 && !this.selectedColor()) {
      this.toastr.error('Por favor selecciona un color', 'Selección requerida');
      return;
    }

    const cartItem = {
      product,
      quantity: this.selectedQuantity(),
      selectedSize: this.selectedSize(),
      selectedColor: this.selectedColor()
    };

    this.cartService.addItem(cartItem);
  }

  increaseQuantity() {
    const product = this.product();
    if (product && this.selectedQuantity() < product.stock) {
      this.selectedQuantity.set(this.selectedQuantity() + 1);
    }
  }

  decreaseQuantity() {
    if (this.selectedQuantity() > 1) {
      this.selectedQuantity.set(this.selectedQuantity() - 1);
    }
  }

  selectSize(size: string) {
    this.selectedSize.set(size);
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
  }

  getPriceWithDiscount(): number {
    const product = this.product();
    if (!product) return 0;
    return this.productService.getPriceWithDiscount(product);
  }

  hasDiscount(): boolean {
    const product = this.product();
    return product ? !!(product.descuento && product.descuento > 0) : false;
  }

  getTotalPrice(): number {
    return this.getPriceWithDiscount() * this.selectedQuantity();
  }



  getStockClass(): string {
    const product = this.product();
    if (!product) return '';
    
    if (product.stock === 0) return 'text-red-600';
    if (product.stock <= 5) return 'text-yellow-600';
    return 'text-green-600';
  }

  getStockText(): string {
    const product = this.product();
    if (!product) return '';
    
    if (!product.disponible || product.stock === 0) return 'Agotado';
    if (product.stock <= 5) return `Solo ${product.stock} disponibles`;
    return 'Disponible';
  }
}
